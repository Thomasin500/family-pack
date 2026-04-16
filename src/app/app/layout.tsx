import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import QueryProvider from "@/components/providers/query-provider";
import { WeightUnitProvider } from "@/components/providers/weight-unit-provider";
import { ConfirmProvider } from "@/components/providers/confirm-provider";
import { NavBar } from "@/components/app/nav-bar";
import { ChangelogFooter } from "@/components/app/changelog-footer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <QueryProvider>
      <WeightUnitProvider>
        <ConfirmProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <NavBar user={user} />
            <main className="flex-1">{children}</main>
            <ChangelogFooter />
          </div>
        </ConfirmProvider>
      </WeightUnitProvider>
    </QueryProvider>
  );
}
