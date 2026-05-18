import Link from 'next/link'
import { Bell, ExternalLink, Sparkles, FileDown, ImageIcon } from 'lucide-react'
import type { Notice } from '@/types'
import { formatDateShort, timeAgo } from '@/lib/utils'

const UNI_ACCENT: Record<string, { bar: string; label: string; labelBg: string }> = {
  TU:    { bar: 'bg-blue-500',    label: 'text-blue-700',    labelBg: 'bg-blue-50 border-blue-200' },
  KU:    { bar: 'bg-emerald-500', label: 'text-emerald-700', labelBg: 'bg-emerald-50 border-emerald-200' },
  PU:    { bar: 'bg-amber-500',   label: 'text-amber-700',   labelBg: 'bg-amber-50 border-amber-200' },
  PurU:  { bar: 'bg-purple-500',  label: 'text-purple-700',  labelBg: 'bg-purple-50 border-purple-200' },
  NEB:   { bar: 'bg-red-500',     label: 'text-red-700',     labelBg: 'bg-red-50 border-red-200' },
  CTEVT: { bar: 'bg-orange-500',  label: 'text-orange-700',  labelBg: 'bg-orange-50 border-orange-200' },
}
const DEFAULT_ACCENT = { bar: 'bg-brand', label: 'text-brand', labelBg: 'bg-brand-50 border-brand-100' }

function isNew(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return false
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000
}

interface NoticeCardProps {
  notice:   Notice
  compact?: boolean
  dark?:    boolean
}

export default function NoticeCard({ notice, compact = false, dark = false }: NoticeCardProps) {
  const shortName = notice.university?.short_name || 'TU'
  const accent    = UNI_ACCENT[shortName] ?? DEFAULT_ACCENT
  const fresh     = isNew(notice.published_date)
  const hasPdf    = notice.content_type === 'pdf'
  const hasImage  = notice.content_type === 'image'

  // ── Compact (homepage dark panels + feeds) ────────────────────
  if (compact) {
    return (
      <Link href={`/notices/${notice.slug}`} className="block group">
        <div
          className={`relative flex items-start gap-3 py-3 pl-4 pr-3 rounded-lg border-b last:border-0 transition-colors ${
            dark
              ? 'border-white/8 hover:bg-white/5'
              : 'border-border hover:bg-slate-50'
          }`}
        >
          {/* Colored left bar */}
          <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${accent.bar}`} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5 flex-wrap">
              <p className={`text-sm font-medium line-clamp-1 flex-1 min-w-0 transition-colors ${
                dark
                  ? 'text-slate-200 group-hover:text-white'
                  : 'text-ink group-hover:text-brand'
              }`}>
                {notice.title}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasPdf && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <FileDown className="w-2.5 h-2.5" />PDF
                  </span>
                )}
                {hasImage && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700">
                    <ImageIcon className="w-2.5 h-2.5" />Img
                  </span>
                )}
                {fresh && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                    <Sparkles className="w-2.5 h-2.5" />New
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${accent.labelBg} ${accent.label}`}>
                {shortName}
              </span>
              <span className={`text-xs font-mono ${dark ? 'text-slate-500' : 'text-ink-muted'}`}>
                {timeAgo(notice.published_date)}
              </span>
            </div>
          </div>

          <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity mt-0.5 ${dark ? 'text-slate-400' : 'text-ink-muted'}`} />
        </div>
      </Link>
    )
  }

  // ── Full list card (notices page) ─────────────────────────────
  return (
    <Link href={`/notices/${notice.slug}`} className="block group">
      <div className="relative bg-card rounded-xl border border-border overflow-hidden
                      p-4 pl-5 transition-all duration-200 hover:shadow-card-lg hover:border-border-strong
                      hover:-translate-y-0.5">
        {/* Left w-1 colored indicator bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent.bar}`} />

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-border flex items-center justify-center flex-shrink-0">
            <Bell className="w-4.5 h-4.5 text-ink-muted" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title + content-type badges */}
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors flex-1">
                {notice.title}
              </h3>
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                {hasPdf && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    <FileDown className="w-2.5 h-2.5" />PDF
                  </span>
                )}
                {hasImage && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 whitespace-nowrap">
                    <ImageIcon className="w-2.5 h-2.5" />Image
                  </span>
                )}
                {fresh && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5" />New
                  </span>
                )}
              </div>
            </div>

            {/* Meta row — font-mono */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${accent.labelBg} ${accent.label}`}>
                {notice.university?.short_name}
              </span>
              {notice.university?.name && (
                <span className="text-[10px] font-mono text-ink-muted truncate max-w-[140px]">
                  {notice.university.name}
                </span>
              )}
              <span className="text-[10px] font-mono text-ink-muted ml-auto">
                {formatDateShort(notice.published_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
