import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Bell, CheckCheck, Clock3, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import {
  getNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from '../../services/notificacionesService'
import type { Notificacion } from '../../types'

const tipoIcon: Record<string, { Icon: typeof Bell; className: string }> = {
  tardanza: { Icon: AlertTriangle, className: 'text-danger bg-danger-soft' },
  extra: { Icon: Clock3, className: 'text-brand bg-brand-soft' },
  licencia: { Icon: Sparkles, className: 'text-success bg-success-soft' },
}

export function NovedadesPanel({ onNew }: { onNew?: (mensaje: string) => void }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notificacion[]>([])
  const onNewRef = useRef(onNew)
  onNewRef.current = onNew

  async function load() {
    try {
      setItems(await getNotificaciones())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel('novedades-admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones' },
        (payload) => {
          const nuevo = payload.new as Notificacion
          if (!nuevo || !nuevo.mensaje) return
          setItems((prev) => [nuevo, ...prev].slice(0, 50))
          onNewRef.current?.(nuevo.mensaje)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const unread = items.filter((item) => !item.leida).length

  async function handleOpen() {
    setOpen((value) => !value)
  }

  async function handleMarkOne(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, leida: true } : item)))
    try {
      await marcarLeida(id)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((item) => ({ ...item, leida: true })))
    try {
      await marcarTodasLeidas()
    } catch (err) {
      console.error(err)
    }
  }

  function relativeDate(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-xl p-2 text-ink-soft transition hover:bg-surface-muted hover:text-ink"
        title="Novedades"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div>
                <p className="font-semibold text-ink">Novedades</p>
                <p className="text-xs text-ink-soft">
                  {unread > 0 ? `${unread} sin leer` : 'Todo al día'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand transition hover:bg-brand-soft"
                  >
                    <CheckCheck size={14} />
                    Leer todas
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-ink-soft hover:bg-surface-muted"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-soft">
                  Sin novedades todavía.
                </p>
              ) : (
                items.map((item) => {
                  const config = tipoIcon[item.tipo] ?? {
                    Icon: Bell,
                    className: 'text-brand bg-brand-soft',
                  }
                  const Icon = config.Icon

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMarkOne(item.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-surface-muted ${
                        item.leida ? 'opacity-60' : ''
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.className}`}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink">{item.mensaje}</span>
                        <span className="mt-0.5 block text-[11px] text-ink-soft">
                          {relativeDate(item.created_at)}
                        </span>
                      </span>
                      {!item.leida && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
