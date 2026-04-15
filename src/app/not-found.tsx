import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center bg-background">
      <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
      <p className="text-on-surface-variant">
        This page doesn&apos;t exist. Maybe the trail took a wrong turn.
      </p>
      <Link
        href="/app"
        className="mt-2 rounded-xl bg-gradient-to-br from-primary-container to-primary px-6 py-2.5 text-sm font-bold text-on-primary-container hover:brightness-110 active:scale-95 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
