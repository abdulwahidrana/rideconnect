export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="skeleton h-5 w-1/3" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-10 w-full" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton h-7 w-20" />
      <div className="skeleton h-4 w-28" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 !p-4">
          <div className="skeleton h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5" />
            <div className="skeleton h-3 w-3/5" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
