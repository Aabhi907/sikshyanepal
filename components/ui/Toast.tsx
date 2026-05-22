'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export interface ToastItem {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

const CONFIGS = {
  success: { Icon: CheckCircle, bg: 'bg-green-900/95', border: 'border-green-700', text: 'text-green-200' },
  error:   { Icon: XCircle,     bg: 'bg-red-900/95',   border: 'border-red-700',   text: 'text-red-200'   },
  info:    { Icon: Info,        bg: 'bg-blue-900/95',  border: 'border-blue-700',  text: 'text-blue-200'  },
}

export function ToastList({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const { Icon, bg, border, text } = CONFIGS[t.variant]
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border
                        shadow-2xl backdrop-blur-sm animate-fade-in ${bg} ${border}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${text}`} />
            <p className={`text-sm font-medium flex-1 ${text}`}>{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className={`${text} opacity-50 hover:opacity-100 transition-opacity`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((message: string, variant: ToastItem['variant']) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const toast = {
    success: (msg: string) => push(msg, 'success'),
    error:   (msg: string) => push(msg, 'error'),
    info:    (msg: string) => push(msg, 'info'),
  }

  return { toasts, toast, dismiss }
}
