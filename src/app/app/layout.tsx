import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import QueryProvider from "@/components/providers/query-provider";
import { WeightUnitProvider } from "@/components/providers/weight-unit-provider";
import { NavBar } from "@/components/app/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="min-h-screen bg-background">
          <NavBar user={user} />
          <main>{children}</main>
        </div>
      </WeightUnitProvider>
    </QueryProvider>
  );
}
