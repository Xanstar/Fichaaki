import { useEffect, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  type: ToastType
  message: string
}

const styles: Record<ToastType, { bg: string; text: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-success-soft border-success/20',
    text: 'text-success',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-danger-soft border-danger/20',
    text: 'text-danger',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-brand-soft border-brand/20',
    text: 'text-brand',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
}

export function Toast({ toast, onClose }: { toast: ToastData; onClose: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 3200)
    return () => clearTimeout(t)
  }, [toast.id, onClose])

  const s = styles[toast.type]

  return (
    <div
      role="status"
      className={`animate-toast-in flex items-center gap-3 rounded-2xl border ${s.bg} px-4 py-3 shadow-lg shadow-ink/5 backdrop-blur-sm`}
    >
      <span className={s.text}>{s.icon}</span>
      <p className="text-sm font-medium text-ink">{toast.message}</p>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <Toast toast={t} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}
