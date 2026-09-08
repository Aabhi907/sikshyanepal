'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  redirectTo?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  initialValue?: string
}

export default function SearchBar({
  placeholder = 'Search colleges, programs...',
  redirectTo = '/colleges',
  className = '',
  size = 'md',
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(query.trim() ? `${redirectTo}?q=${encodeURIComponent(query.trim())}` : redirectTo)
  }

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`w-full pl-12 pr-32 ${sizeClasses[size]} border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm`}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-24 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}
