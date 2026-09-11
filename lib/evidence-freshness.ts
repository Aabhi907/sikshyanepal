export const EVIDENCE_MAX_AGE_DAYS: Record<string, number> = {
  admission_deadline: 1,
  result: 7,
  scholarship: 30,
  fee: 90,
  programs: 90,
  affiliation: 180,
  contact: 180,
  facilities: 365,
}

export function evidenceFreshness(fieldKey: string, checkedAt: string, now = Date.now()) {
  const checked = new Date(checkedAt).getTime()
  const maxAgeDays = EVIDENCE_MAX_AGE_DAYS[fieldKey] || 180
  if (Number.isNaN(checked)) return { ageDays: null, maxAgeDays, stale: true, dueInDays: null }
  const ageDays = Math.max(0, Math.floor((now - checked) / 86_400_000))
  return { ageDays, maxAgeDays, stale: ageDays > maxAgeDays, dueInDays: maxAgeDays - ageDays }
}
