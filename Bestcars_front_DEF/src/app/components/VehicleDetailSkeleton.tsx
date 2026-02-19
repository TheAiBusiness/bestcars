import React from 'react';
import { Skeleton } from './ui/skeleton';

export function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header placeholder */}
      <div className="h-[68px] bg-white/95" />

      <main className="max-w-[1280px] mx-auto my-6 mb-32 px-6">
        {/* Gallery skeleton */}
        <Skeleton className="w-full aspect-[16/9] rounded-2xl mb-6 bg-white/5" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_.85fr] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 bg-white/5" />
              <Skeleton className="h-4 w-1/2 bg-white/5" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-32 bg-white/5" />
                <Skeleton className="h-10 w-32 bg-white/5" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
              ))}
            </div>

            <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
          </div>

          {/* Right column - Contact form skeleton */}
          <div>
            <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
          </div>
        </div>
      </main>
    </div>
  );
}
