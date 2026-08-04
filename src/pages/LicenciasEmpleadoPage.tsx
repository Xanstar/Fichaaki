import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarOff, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  getMisLicencias,
  solicitarLicencia,
} from '../services/licenciasService'
import type { Licencia } from '../types'
import { useToasts } from '../hooks/useToasts'
import { ToastContainer } from '../components/Toast'

const inputClasses =
  'w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

const tipoOptions = [
  { value: 'personal', label: 'Personal' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'otro', label: 'Otro' },
]

function estadoBadge(estado: Licencia['estado']) {
  if (estado === 'aprobada') return 'bg-success-soft text-success'
  if (estado === 'rechazada') return 'bg-danger-soft text-danger'
  return 'bg-amber-100 text-amber-600'
}

function estadoLabel(estado: Licencia['estado']) {
  if (estado === 'aprobada') return 'Aprobada'
  if (estado === 'rechazada') return 'Rechazada'
  return 'Pendiente'
}

export function LicenciasEmpleadoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()

  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState('personal')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!user) return
    try {
      setLicencias(await getMisLicencias(user.id))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  async function handleSolicitar() {
    if (!user) return
    if (!fechaInicio || !fechaFin) {
      setError('Completá las fechas.')
      return
    }
    if (fechaFin < fechaInicio) {
      setError('La fecha fin no puede ser anterior a la fecha inicio.')
      return
    }

    try {
      setLoading(true)
      setError('')

      await solicitarLicencia({
        employee_id: user.id,
        tipo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        motivo: motivo.trim(),
      })

      setOpen(false)
      setMotivo('')
      setFechaInicio('')
      setFechaFin('')
      push('success', 'Licencia solicitada. Queda a la espera de aprobación.')
      load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo solicitar la licencia.'
      setError(message)
      push('error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-surface-muted">
        <header className="border-b border-border-subtle bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/empleado')}
                className="rounded-xl border border-border-subtle p-2 text-ink hover:bg-surface-muted"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-ink">Mis licencias</h1>
                <p className="text-sm text-ink-soft">
                  Solicitá y seguí tus ausencias.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setError('')
                setOpen(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Solicitar licencia
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-5">
          {licencias.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border-subtle bg-surface p-10 text-center shadow-sm">
              <CalendarOff size={70} className="mx-auto mb-5 text-brand" />
              <h2 className="text-xl font-semibold text-ink">Sin licencias</h2>
              <p className="mt-2 text-ink-soft">
                Todavía no pediste ninguna licencia.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {licencias.map((licencia) => (
                <div
                  key={licencia.id}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-ink">
                          {tipoOptions.find((item) => item.value === licencia.tipo)?.label ?? licencia.tipo}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoBadge(
                            licencia.estado
                          )}`}
                        >
                          {estadoLabel(licencia.estado)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-ink-soft">
                        {licencia.fecha_inicio} al {licencia.fecha_fin}
                      </p>

                      {licencia.motivo && (
                        <p className="mt-2 text-sm text-ink">{licencia.motivo}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={dismiss} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm md:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl md:max-w-xl md:rounded-3xl"
            >
              <div className="border-b border-border-subtle px-6 py-5">
                <h2 className="text-2xl font-bold text-ink">Solicitar licencia</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  El admin deberá aprobar la solicitud.
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className={inputClasses}
                  >
                    {tipoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Desde</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Hasta</label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Motivo (opcional)
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Motivo de la licencia"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>

              <div className="border-t border-border-subtle p-6">
                <button
                  onClick={handleSolicitar}
                  disabled={loading}
                  className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Enviando...' : 'Solicitar licencia'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
