"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-on-surface-variant">
        {error.message || "An unexpected error occurred. Try refreshing the page."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-gradient-to-br from-primary-container to-primary px-6 py-2.5 text-sm font-bold text-on-primary-container hover:brightness-110 active:scale-95 transition-all"
      >
        Try again
      </button>
    </div>
  );
}
