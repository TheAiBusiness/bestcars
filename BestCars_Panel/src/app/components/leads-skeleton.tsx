import { Skeleton } from "./ui/skeleton";

export function LeadsSkeleton() {
  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6"
          >
            <Skeleton className="h-4 w-20 mb-2 bg-white/10" />
            <Skeleton className="h-8 w-12 bg-white/10" />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <Skeleton className="flex-1 h-12 rounded-xl bg-white/10" />
        <Skeleton className="flex-1 h-12 rounded-xl bg-white/10" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6"
          >
            <div className="flex gap-6">
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-xl flex-shrink-0 bg-white/10" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-40 bg-white/10" />
                <Skeleton className="h-4 w-56 bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
                <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
