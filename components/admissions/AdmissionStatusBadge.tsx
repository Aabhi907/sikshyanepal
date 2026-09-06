import { CalendarClock } from 'lucide-react'
import { admissionState, daysUntil } from '@/lib/admissions'
import type { Admission } from '@/types'

export default function AdmissionStatusBadge({ admission }: { admission: Pick<Admission, 'status' | 'application_open_at' | 'application_deadline'> }) {
  const state = admissionState(admission)
  const days = daysUntil(admission.application_deadline)
  const config = {
    open: { label: days === 0 ? 'Closes today' : 'Open now', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    closing_soon: { label: days === 0 ? 'Closes today' : `${days} day${days === 1 ? '' : 's'} left`, classes: 'border-orange-200 bg-orange-50 text-orange-700' },
    upcoming: { label: admission.application_open_at ? `Opens ${new Date(admission.application_open_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}` : 'Opening soon', classes: 'border-blue-200 bg-blue-50 text-blue-700' },
    closed: { label: 'Applications closed', classes: 'border-gray-200 bg-gray-100 text-gray-500' },
    date_unavailable: { label: 'Deadline not announced', classes: 'border-blue-100 bg-blue-50 text-blue-700' },
  }[state]
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.classes}`}><CalendarClock className="h-3.5 w-3.5" />{config.label}</span>
}
