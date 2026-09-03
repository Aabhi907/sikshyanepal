import { CalendarClock } from 'lucide-react'
import { daysUntil, deadlineState } from '@/lib/admissions'

export default function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const state = deadlineState(deadline)
  const days = daysUntil(deadline)
  const config = {
    open: { label: days === 0 ? 'Closes today' : `${days} days left`, classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    closing_soon: { label: days === 0 ? 'Closes today' : `${days} day${days === 1 ? '' : 's'} left`, classes: 'border-orange-200 bg-orange-50 text-orange-700' },
    closed: { label: 'Applications closed', classes: 'border-gray-200 bg-gray-100 text-gray-500' },
    date_unavailable: { label: 'Deadline not announced', classes: 'border-blue-100 bg-blue-50 text-blue-700' },
  }[state]
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.classes}`}><CalendarClock className="h-3.5 w-3.5" />{config.label}</span>
}

