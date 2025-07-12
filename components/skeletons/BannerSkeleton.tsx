export function BannerSkeleton() {
  return (
    <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
      {/* Main skeleton content */}
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      
      {/* Navigation arrows skeleton */}
      <div className="hidden sm:block absolute left-2 top-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-white/30 dark:bg-gray-600/30 rounded-full animate-pulse" />
      </div>
      <div className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-white/30 dark:bg-gray-600/30 rounded-full animate-pulse" />
      </div>
      
      {/* Dots indicator skeleton */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 sm:w-3 sm:h-3 bg-white/50 dark:bg-gray-400/50 rounded-full animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
