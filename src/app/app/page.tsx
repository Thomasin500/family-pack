import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function AppPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allUsers = await db.select().from(users);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Family Pack</h1>
      <div className="mb-6 rounded-lg border p-4">
        <p className="text-lg">
          Logged in as: <strong>{session.user.name}</strong>
        </p>
        <p className="text-sm text-neutral-500">{session.user.email}</p>
        {session.user.image && (
          <Image
            src={session.user.image}
            alt=""
            width={48}
            height={48}
            className="mt-2 rounded-full"
          />
        )}
      </div>
      <div className="mb-6 rounded-lg border p-4">
        <p className="text-sm text-neutral-500">
          Users in database: {allUsers.length}
        </p>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-lg border px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
