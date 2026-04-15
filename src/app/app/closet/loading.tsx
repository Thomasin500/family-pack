export default function ClosetLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="h-10 w-48 rounded-xl bg-surface-high animate-pulse mb-8" />
      <div className="h-10 w-64 rounded-full bg-surface-high animate-pulse mb-6" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    </div>
  );
}
