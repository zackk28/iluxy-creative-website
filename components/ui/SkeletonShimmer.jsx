import React from "react";

export function SkeletonShimmer({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-800/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-neutral-700/40 before:to-transparent ${className}`}
    />
  );
}

export function PackageCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-5 space-y-4">
      <SkeletonShimmer className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <SkeletonShimmer className="h-5 w-2/3" />
        <SkeletonShimmer className="h-4 w-1/3" />
      </div>
      <div className="space-y-1 pt-2">
        <SkeletonShimmer className="h-3 w-full" />
        <SkeletonShimmer className="h-3 w-4/5" />
      </div>
      <div className="flex justify-between items-center pt-4">
        <SkeletonShimmer className="h-7 w-28 rounded-lg" />
        <SkeletonShimmer className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}
