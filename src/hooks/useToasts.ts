import { useCallback, useRef, useState } from 'react'
import type { ToastData, ToastType } from '../components/Toast'

export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const nextId = useRef(1)

  const push = useCallback((type: ToastType, message: string) => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, push, dismiss }
}
