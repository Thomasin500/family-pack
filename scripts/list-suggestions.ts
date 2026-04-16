/**
 * Print every roadmap suggestion across all households with author + household
 * context. Aimed at dev triage.
 *
 * Usage (local Docker):
 *   npm run suggestions:list
 *
 * Usage (Neon prod):
 *   DATABASE_URL="<neon-url>" npm run suggestions:list
 */
import { db } from "../src/db";
import { roadmapSuggestions, users, households } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { ROADMAP } from "../src/lib/roadmap";

async function main() {
  const rows = await db
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

  if (rows.length === 0) {
    console.log("No suggestions yet.");
    return;
  }

  const byPhase = new Map<string, typeof rows>();
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
      console.log(
        `  • [${r.status}] ${r.title}\n    — ${r.authorName ?? "?"} (${r.authorEmail ?? "no email"}) in ${r.householdName ?? "?"} @ ${when}`
      );
      const body = r.description
        .split("\n")
        .map((line) => `      ${line}`)
        .join("\n");
      console.log(body);
    }
  }
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
