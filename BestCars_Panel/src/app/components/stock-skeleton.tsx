import { Skeleton } from "./ui/skeleton";

export function StockSkeleton() {
  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6"
          >
            <Skeleton className="h-4 w-20 mb-2 bg-white/10" />
            <Skeleton className="h-8 w-16 bg-white/10" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] overflow-hidden"
          >
            <Skeleton className="h-48 w-full bg-white/10" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4 bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-white/10" />
              <Skeleton className="h-8 w-28 bg-white/10" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-10 bg-white/10" />
                <Skeleton className="h-10 bg-white/10" />
                <Skeleton className="h-10 bg-white/10" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
