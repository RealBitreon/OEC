export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2" />
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
