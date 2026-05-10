export function SkeletonCard() {
  return (
    <div className="border border-zinc-200 rounded p-5 bg-white animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-24 mb-3" />
      <div className="h-7 bg-zinc-100 rounded w-16" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="border border-zinc-200 rounded p-5 bg-white animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-32 mb-4" />
      <div className="h-64 bg-zinc-50 rounded" />
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-zinc-100 rounded w-24 mb-2" />
          <div className="h-10 bg-zinc-100 rounded" />
        </div>
      ))}
    </div>
  );
}
