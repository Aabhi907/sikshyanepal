import type { College } from '@/types'

const CAUTION = /\b(verify|confirm|check|exact current|current contact|current intake|before display)\b/i

export function cleanCollegeText(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value.replace(/\s*\([^)]*(?:verify|confirm|check|before display)[^)]*\)/gi, '').replace(/\s*\/\s*/g, ', ').replace(/\s{2,}/g, ' ').trim()
  return cleaned || null
}

export function collegeDisplayLocation(college: Pick<College, 'location' | 'local_level' | 'district' | 'province'>): string | null {
  const location = cleanCollegeText(college.location)
  if (location && !CAUTION.test(location)) return location
  return [college.local_level, college.district, college.province].map(cleanCollegeText).filter((part, index, all) => part && all.indexOf(part) === index).join(', ') || null
}

export const collegeDisplayAffiliation = (value: string | null | undefined) => cleanCollegeText(value)

export function collegeDisplayPrograms(value: string | null | undefined): string[] {
  return (value || '').split(';').map(cleanCollegeText).filter((name): name is string => Boolean(name) && !CAUTION.test(name!) && !/^(other|exact current|program list)/i.test(name!))
}

export function safeCollegeAddress(value: string | null | undefined): string | null {
  return value && !CAUTION.test(value) ? cleanCollegeText(value) : null
}
