import type { Admission } from '@/types'

export type DeadlineState = 'open' | 'closing_soon' | 'closed' | 'date_unavailable'
export type AdmissionState = DeadlineState | 'upcoming'

export function deadlineState(deadline: string | null, now = new Date()): DeadlineState {
  if (!deadline) return 'date_unavailable'
  const end = new Date(deadline)
  if (Number.isNaN(end.getTime())) return 'date_unavailable'
  const remaining = end.getTime() - now.getTime()
  if (remaining < 0) return 'closed'
  if (remaining <= 7 * 86_400_000) return 'closing_soon'
  return 'open'
}

export function daysUntil(deadline: string | null, now = new Date()): number | null {
  if (!deadline) return null
  const remaining = new Date(deadline).getTime() - now.getTime()
  return Number.isNaN(remaining) ? null : Math.max(0, Math.ceil(remaining / 86_400_000))
}

export function admissionState(admission: Pick<Admission, 'status' | 'application_open_at' | 'application_deadline'>, now = new Date()): AdmissionState {
  if (admission.status === 'closed' || admission.status === 'archived') return 'closed'
  const opensAt = admission.application_open_at ? new Date(admission.application_open_at) : null
  if (opensAt && !Number.isNaN(opensAt.getTime()) && opensAt.getTime() > now.getTime()) return 'upcoming'
  return deadlineState(admission.application_deadline, now)
}

export function admissionLocation(admission: Admission): string | null {
  if (admission.school) return [admission.school.district, admission.school.province].filter(Boolean).join(', ')
  return admission.college?.location || null
}
