export default function TripsLoading() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
        <div className="h-9 w-28 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl border bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
