import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, Banknote } from 'lucide-react'
import type { College } from '@/types'

// Affiliation short names
function affiliationShort(full: string | null): string | null {
  if (!full) return null
  if (full.includes('Tribhuvan'))  return 'TU'
  if (full.includes('Kathmandu'))  return 'KU'
  if (full.includes('Pokhara'))    return 'PU'
  if (full.includes('Purbanchal')) return 'PurU'
  if (full.toLowerCase().includes('private')) return 'Private'
  return full.slice(0, 6)
}

// Affiliation-based cover gradient fallbacks
const AFFIL_GRADIENT: Record<string, string> = {
  'Tribhuvan University':  'from-blue-600  to-blue-800',
  'Kathmandu University':  'from-emerald-600 to-emerald-800',
  'Pokhara University':    'from-amber-500 to-orange-700',
  'Purbanchal University': 'from-purple-600 to-purple-800',
}

// Affiliation badge colors
const AFFIL_BADGE: Record<string, string> = {
  'Tribhuvan University':  'bg-blue-50   text-blue-700   border-blue-200',
  'Kathmandu University':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pokhara University':    'bg-amber-50  text-amber-700  border-amber-200',
  'Purbanchal University': 'bg-purple-50 text-purple-700 border-purple-200',
}

function formatFee(n: number): string {
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `Rs ${(n / 1_000).toFixed(0)}K`
  return `Rs ${n}`
}

interface CollegeCardProps {
  college: College & {
    avg_rating?:   number
    review_count?: number
    fee_min?:      number
    fee_max?:      number
  }
}

export default function CollegeCard({ college }: CollegeCardProps) {
  const affiliShort   = affiliationShort(college.affiliation)
  const coverGradient = AFFIL_GRADIENT[college.affiliation ?? ''] ?? 'from-gray-600 to-gray-800'
  const badgeClass    = AFFIL_BADGE[college.affiliation ?? ''] ?? 'bg-gray-50 text-gray-600 border-gray-200'

  const topPrograms = (college.programs ?? [])
    .slice(0, 3)
    .map((cp) => cp.program?.name)
    .filter(Boolean) as string[]

  const hasFees  = college.fee_min != null && college.fee_max != null
  const feeLabel = hasFees
    ? college.fee_min === college.fee_max
      ? formatFee(college.fee_min!)
      : `${formatFee(college.fee_min!)} – ${formatFee(college.fee_max!)}`
    : null

  return (
    <Link href={`/colleges/${college.slug}`} className="block group">
      <div
        className={`bg-white rounded-2xl border overflow-hidden flex flex-col h-full
                    transition-all duration-200 hover:shadow-lg hover:-translate-y-1
                    ${college.is_featured
                      ? 'border-orange-300 shadow-card'
                      : 'border-gray-200 shadow-card hover:border-[#1847c4]'
                    }`}
      >
        {/* ── Cover ─────────────────────────────────────── */}
        <div className={`relative h-40 bg-gradient-to-br ${coverGradient} flex-shrink-0 overflow-hidden`}>
          {college.cover_url ? (
            <Image
              src={college.cover_url}
              alt={college.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '18px 18px',
                }}
              />
              <span className="absolute -right-2 -bottom-3 font-display font-black text-[6rem] leading-none text-white/15 select-none">
                {college.name.charAt(0)}
              </span>
            </>
          )}

          {/* Gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

          {/* Featured badge */}
          {college.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f97316] text-white shadow-sm">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* Affiliation badge */}
          {affiliShort && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border bg-white/90 ${badgeClass}`}>
                {affiliShort}
              </span>
            </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1">
          {/* Logo + Name */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-card flex-shrink-0 -mt-8 relative z-10">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={`${college.name} logo`}
                  width={44}
                  height={44}
                  className="rounded-xl object-contain"
                />
              ) : (
                <span className="text-base font-display font-bold text-[#1847c4]">{college.name.charAt(0)}</span>
              )}
            </div>
            <div className="pt-1 min-w-0">
              <h3 className="font-display font-bold text-ink text-[15px] leading-snug line-clamp-2 group-hover:text-[#1847c4] transition-colors">
                {college.name}
              </h3>
            </div>
          </div>

          {/* Location */}
          {college.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{college.location}</span>
            </div>
          )}

          {/* Rating */}
          {college.avg_rating != null && college.avg_rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(college.avg_rating!)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-600">{college.avg_rating.toFixed(1)}</span>
              {college.review_count != null && college.review_count > 0 && (
                <span className="text-xs text-gray-400">({college.review_count})</span>
              )}
            </div>
          )}

          {/* Programs */}
          {topPrograms.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {topPrograms.map((name) => (
                <span key={name}
                  className="px-2 py-0.5 bg-blue-50 text-[#1847c4] text-[11px] font-medium rounded-full border border-blue-200">
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Fee */}
          {feeLabel && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <Banknote className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{feeLabel}</span>
              <span className="text-gray-400">/ year</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            {college.established_year && (
              <span className="text-xs font-mono text-gray-400">Est. {college.established_year}</span>
            )}
            <span className="text-xs text-[#1847c4] font-semibold flex items-center gap-1 ml-auto group-hover:gap-1.5 transition-all">
              View Profile <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
