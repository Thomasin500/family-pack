export default function TripsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-32 rounded-xl bg-surface-high animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-surface-high animate-pulse" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    </div>
  );
}
