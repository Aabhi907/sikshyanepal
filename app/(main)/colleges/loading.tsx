// Skeleton shown by Next.js while colleges/page.tsx is loading
function CollegeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Cover */}
      <div className="h-[140px] bg-gray-200 animate-pulse flex-shrink-0 relative">
        {/* Badge placeholders */}
        <div className="absolute top-3 left-3 h-6 w-10 bg-white/60 rounded-full animate-pulse" />
      </div>
      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Logo + name row */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 -mt-8 relative z-10 flex-shrink-0 animate-pulse" />
          <div className="pt-1 min-w-0 flex-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        {/* Location */}
        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mt-0.5 mb-2" />
        {/* Programs */}
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse mb-2" />
        {/* Fee */}
        <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-2" />
        {/* Bottom row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function CollegesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Search */}
      <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse mb-5" />

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <CollegeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
