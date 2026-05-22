'use client'

import { useEffect } from 'react'
import { AlertTriangle, Info } from 'lucide-react'

export interface ConfirmState {
  isOpen:        boolean
  title:         string
  message:       string
  confirmLabel?: string
  variant?:      'danger' | 'warning' | 'info'
  onConfirm:     () => void
}

interface Props extends ConfirmState {
  onCancel: () => void
}

export const CONFIRM_CLOSED: ConfirmState = {
  isOpen: false, title: '', message: '', onConfirm: () => {},
}

export default function ConfirmDialog({
  isOpen, title, message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const btnClass =
    variant === 'danger'  ? 'bg-red-600   hover:bg-red-700'   :
    variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                            'bg-blue-600  hover:bg-blue-700'

  const iconWrap =
    variant === 'danger'  ? 'text-red-400   bg-red-900/30'   :
    variant === 'warning' ? 'text-amber-400 bg-amber-900/30' :
                            'text-blue-400  bg-blue-900/30'

  const Icon = variant === 'info' ? Info : AlertTriangle

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      {/* Panel */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconWrap}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
