/**
 * One-stop dev CLI for roadmap suggestions.
 *
 * Default interactive flow:
 *   npm run suggestions
 *     1. Lists every currently-open suggestion (across all households) with
 *        author, household, timestamp, and body.
 *     2. Prompts: "Mark all as noted? [y/N]"
 *     3. If y, flips every listed row to `status = "noted"` atomically.
 *
 * Non-interactive flags:
 *   --list            Just list (also shows already-noted rows, dimmed).
 *   --note <id> ...   Mark specific IDs (UUID or 6+ char prefix) as noted.
 *   --reopen <id>     Flip a noted suggestion back to open.
 *   --yes             Skip the confirmation prompt in the default flow.
 *
 * Against Neon prod:
 *   DATABASE_URL="<neon-url>" USE_NEON=true npm run suggestions
 */
import * as readline from "node:readline";
import { db } from "../src/db";
import { roadmapSuggestions, users, households } from "../src/db/schema";
import { and, eq, like, or } from "drizzle-orm";
import { ROADMAP } from "../src/lib/roadmap";

type TargetStatus = "noted" | "open";

type Row = {
  id: string;
  phaseId: string | null;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  authorName: string | null;
  authorEmail: string | null;
  householdName: string | null;
};

async function fetchAll(): Promise<Row[]> {
  return db
    .select({
      id: roadmapSuggestions.id,
      phaseId: roadmapSuggestions.phaseId,
      title: roadmapSuggestions.title,
      description: roadmapSuggestions.description,
      status: roadmapSuggestions.status,
      createdAt: roadmapSuggestions.createdAt,
      authorName: users.name,
      authorEmail: users.email,
      householdName: households.name,
    })
    .from(roadmapSuggestions)
    .leftJoin(users, eq(users.id, roadmapSuggestions.userId))
    .leftJoin(households, eq(households.id, roadmapSuggestions.householdId))
    .orderBy(roadmapSuggestions.createdAt);
}

function printGrouped(rows: Row[], opts: { dimNoted: boolean }) {
  const byPhase = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.phaseId ?? "__general__";
    const arr = byPhase.get(key) ?? [];
    arr.push(r);
    byPhase.set(key, arr);
  }
  const totalHouseholds = new Set(rows.map((r) => r.householdName ?? "?")).size;
  console.log(
    `\n${rows.length} suggestion${rows.length === 1 ? "" : "s"} across ${totalHouseholds} household${totalHouseholds === 1 ? "" : "s"}\n` +
      "─".repeat(72)
  );
  for (const [phaseKey, items] of byPhase.entries()) {
    const phase = ROADMAP.find((p) => p.id === phaseKey);
    const heading = phase?.name ?? "General / no specific phase";
    console.log(`\n▸ ${heading}  (${items.length})`);
    for (const r of items) {
      const when = new Date(r.createdAt).toISOString().slice(0, 16).replace("T", " ");
      const dim = opts.dimNoted && r.status !== "open" ? "\x1b[2m" : "";
      const reset = opts.dimNoted ? "\x1b[0m" : "";
      const shortId = r.id.slice(0, 8);
      console.log(
        `  ${dim}• [${r.status}] ${r.title}   ${shortId}` +
          `\n    — ${r.authorName ?? "?"} (${r.authorEmail ?? "no email"}) in ${r.householdName ?? "?"} @ ${when}${reset}`
      );
      const body = r.description
        .split("\n")
        .map((line) => `      ${dim}${line}${reset}`)
        .join("\n");
      console.log(body);
    }
  }
  console.log();
}

async function findSuggestion(idOrPrefix: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPrefix)) {
    return db.query.roadmapSuggestions.findFirst({
      where: eq(roadmapSuggestions.id, idOrPrefix),
    });
  }
  if (idOrPrefix.length < 6) {
    throw new Error(
      `Short ID "${idOrPrefix}" — need at least 6 characters, or a full UUID, to disambiguate.`
    );
  }
  const matches = await db
    .select()
    .from(roadmapSuggestions)
    .where(or(like(roadmapSuggestions.id, `${idOrPrefix}%`)))
    .limit(2);
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    throw new Error(`Prefix "${idOrPrefix}" matched more than one suggestion — need more chars.`);
  }
  return matches[0];
}

async function setStatusForIds(ids: string[], status: TargetStatus) {
  for (const idArg of ids) {
    const found = await findSuggestion(idArg);
    if (!found) {
      console.error(`✗ Not found: ${idArg}`);
      continue;
    }
    if (found.status === status) {
      console.log(`= Already ${status}: ${found.title}  (${found.id.slice(0, 8)})`);
      continue;
    }
    await db.update(roadmapSuggestions).set({ status }).where(eq(roadmapSuggestions.id, found.id));
    const verb = status === "noted" ? "Noted" : "Reopened";
    console.log(`✓ ${verb}: ${found.title}  (${found.id.slice(0, 8)})`);
  }
}

async function prompt(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(q, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });
}

async function main() {
  const argv = process.argv.slice(2);
  let mode: "default" | "list" | "note" | "reopen" = "default";
  let skipPrompt = false;
  const ids: string[] = [];

  for (const arg of argv) {
    if (arg === "--list") mode = "list";
    else if (arg === "--note") mode = "note";
    else if (arg === "--reopen") mode = "reopen";
    else if (arg === "--yes" || arg === "-y") skipPrompt = true;
    else if (arg.startsWith("--")) throw new Error(`Unknown flag: ${arg}`);
    else ids.push(arg);
  }

  if (mode === "note") {
    if (ids.length === 0) throw new Error("--note requires one or more IDs.");
    await setStatusForIds(ids, "noted");
    return;
  }

  if (mode === "reopen") {
    if (ids.length === 0) throw new Error("--reopen requires one or more IDs.");
    await setStatusForIds(ids, "open");
    return;
  }

  const all = await fetchAll();

  if (mode === "list") {
    if (all.length === 0) console.log("No suggestions yet.");
    else printGrouped(all, { dimNoted: true });
    return;
  }

  // Default interactive flow: show open suggestions, offer to mark them noted.
  const openRows = all.filter((r) => r.status === "open");
  if (openRows.length === 0) {
    console.log("No open suggestions. Use `--list` to see noted ones.");
    return;
  }
  printGrouped(openRows, { dimNoted: false });

  const answer = skipPrompt ? "y" : await prompt(`Mark all ${openRows.length} as noted? [y/N] `);
  if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
    console.log("Leaving status as-is. Use `--note <id>` to mark specific rows.");
    return;
  }
  console.log();
  await setStatusForIds(
    openRows.map((r) => r.id),
    "noted"
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
