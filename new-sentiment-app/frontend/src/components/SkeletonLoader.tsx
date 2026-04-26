const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
);

export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
      {/* Gauge skeleton */}
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl
                      bg-white/5 border border-white/10">
        <Shimmer className="w-36 h-36 rounded-full" />
        <Shimmer className="w-20 h-5" />
      </div>

      {/* Stats skeleton */}
      <div className="flex flex-col gap-3 p-6 rounded-2xl
                      bg-white/5 border border-white/10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Shimmer className="w-24 h-4" />
            <Shimmer className="w-16 h-4" />
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div className="md:col-span-2 p-6 rounded-2xl
                      bg-white/5 border border-white/10 space-y-2">
        <Shimmer className="w-full h-4" />
        <Shimmer className="w-5/6 h-4" />
        <Shimmer className="w-3/4 h-4" />
      </div>
    </div>
  );
}