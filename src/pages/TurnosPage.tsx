import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock3, Pencil, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  createTurno,
  deleteTurno,
  getTurnos,
  updateTurno,
} from '../services/turnosService'
import type { Turno } from '../types'
import { useToasts } from '../hooks/useToasts'
import { ToastContainer } from '../components/Toast'

const inputClasses =
  'w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

interface TurnoForm {
  id?: string
  nombre: string
  jornada_inicio: string
  jornada_fin: string
}

const emptyForm: TurnoForm = { nombre: '', jornada_inicio: '09:00', jornada_fin: '18:00' }

export function TurnosPage() {
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()

  const [turnos, setTurnos] = useState<Turno[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<TurnoForm>(emptyForm)
  const [editing, setEditing] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setTurnos(await getTurnos())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function openEdit(turno: Turno) {
    setEditing(turno)
    setForm({
      id: turno.id,
      nombre: turno.nombre,
      jornada_inicio: turno.jornada_inicio,
      jornada_fin: turno.jornada_fin,
    })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.jornada_inicio || !form.jornada_fin) {
      setError('Completá todos los campos.')
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      jornada_inicio: form.jornada_inicio,
      jornada_fin: form.jornada_fin,
    }

    try {
      setLoading(true)
      setError('')

      if (editing) {
        await updateTurno(editing.id, payload)
        push('success', 'Turno actualizado.')
      } else {
        await createTurno(payload)
        push('success', 'Turno creado.')
      }

      setOpen(false)
      load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el turno.'
      setError(message)
      push('error', message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(turno: Turno) {
    if (!window.confirm(`¿Eliminar el turno "${turno.nombre}"?`)) return
    try {
      await deleteTurno(turno.id)
      push('success', 'Turno eliminado.')
      load()
    } catch (err) {
      push('error', err instanceof Error ? err.message : 'No se pudo eliminar.')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-surface-muted">
        <header className="border-b border-border-subtle bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="rounded-xl border border-border-subtle p-2 text-ink hover:bg-surface-muted"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-ink">Turnos</h1>
                <p className="text-sm text-ink-soft">
                  Horarios de trabajo reutilizables para los empleados.
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Nuevo turno
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-5">
          {turnos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border-subtle bg-surface p-10 text-center shadow-sm">
              <Clock3 size={70} className="mx-auto mb-5 text-brand" />
              <h2 className="text-xl font-semibold text-ink">Todavía no hay turnos</h2>
              <p className="mt-2 text-ink-soft">
                Creá turnos (mañana, tarde, noche...) y asígnalos a los empleados.
              </p>
              <button
                onClick={openCreate}
                className="mt-8 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                + Nuevo turno
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {turnos.map((turno) => (
                <div
                  key={turno.id}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{turno.nombre}</h3>
                      <p className="mt-1 text-sm font-semibold text-brand">
                        {turno.jornada_inicio} - {turno.jornada_fin}
                      </p>
                    </div>
                    <Clock3 className="h-6 w-6 text-brand/60" />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEdit(turno)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 py-2 text-ink transition hover:bg-surface-muted"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(turno)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-danger-soft px-3 py-2 text-danger transition hover:opacity-90"
                    >
                      <Trash2 size={16} />
                    </button>
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
                <h2 className="text-2xl font-bold text-ink">
                  {editing ? 'Editar turno' : 'Nuevo turno'}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  El horario se aplica al calcular tardanzas y horas extra.
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className={inputClasses}
                    placeholder="Turno mañana"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Entrada</label>
                    <input
                      type="time"
                      value={form.jornada_inicio}
                      onChange={(e) => setForm({ ...form, jornada_inicio: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Salida</label>
                    <input
                      type="time"
                      value={form.jornada_fin}
                      onChange={(e) => setForm({ ...form, jornada_fin: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>

              <div className="border-t border-border-subtle p-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear turno'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
