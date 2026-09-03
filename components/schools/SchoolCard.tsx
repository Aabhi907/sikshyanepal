import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, MapPin, School as SchoolIcon, Users } from 'lucide-react'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import type { School } from '@/types'

function ownershipLabel(value: School['ownership_type']) {
  if (!value) return 'School'
  return value === 'institutional'
    ? 'Private / Institutional'
    : value.charAt(0).toUpperCase() + value.slice(1)
}

function gradeLabel(school: School) {
  if (school.grades_from != null && school.grades_to != null) {
    const from = school.grades_from === 0 ? 'ECD' : `Grade ${school.grades_from}`
    return `${from}–${school.grades_to}`
  }
  const labels: Record<string, string> = {
    pre_primary: 'Pre-primary',
    basic: 'Basic level',
    secondary: 'Secondary level',
    higher_secondary: '+2 / Higher secondary',
    multiple: 'Multiple levels',
  }
  return school.school_level ? labels[school.school_level] : null
}

export default function SchoolCard({ school }: { school: School }) {
  const grades = gradeLabel(school)
  return (
    <Link href={`/schools/${school.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary to-[#0d1b3e]">
          {school.cover_url ? (
            <Image src={school.cover_url} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          )}
          <div className="absolute left-3 top-3">
            <VerificationBadge status={school.verification_status} compact />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="relative z-10 -mt-9 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
              {school.logo_url ? (
                <Image src={school.logo_url} alt={`${school.name} logo`} width={44} height={44} className="rounded-lg object-contain" />
              ) : (
                <SchoolIcon className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="line-clamp-2 font-display text-base font-bold leading-snug text-ink transition-colors group-hover:text-primary">
                {school.name}
              </h2>
              {school.iemis_code && <p className="mt-1 font-mono text-[10px] text-gray-400">IEMIS {school.iemis_code}</p>}
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-500">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" />{school.local_level || school.location || school.district}, {school.district}</p>
            {grades && <p className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-gray-400" />{grades}</p>}
            {school.student_count != null && <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gray-400" />{school.student_count.toLocaleString()} students</p>}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs font-medium text-gray-500">{ownershipLabel(school.ownership_type)}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">Profile <ArrowRight className="h-3 w-3" /></span>
          </div>
        </div>
      </article>
    </Link>
  )
}

