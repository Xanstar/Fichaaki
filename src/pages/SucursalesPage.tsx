import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Pencil, Plus, QrCode, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  createSucursal,
  deleteSucursal,
  getSucursales,
  updateSucursal,
} from '../services/sucursalesService'
import type { Sucursal } from '../types'
import { useToasts } from '../hooks/useToasts'
import { ToastContainer } from '../components/Toast'

const inputClasses =
  'w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

interface SucursalForm {
  id?: string
  nombre: string
  direccion: string
  codigo: string
  lat: string
  lng: string
  radio_m: string
}

const emptyForm: SucursalForm = {
  nombre: '',
  direccion: '',
  codigo: '',
  lat: '',
  lng: '',
  radio_m: '200',
}

export function qrUrl(codigo: string, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    `FICHAQUI:${codigo}`
  )}`
}

export function SucursalesPage() {
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()

  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<SucursalForm>(emptyForm)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setSucursales(await getSucursales())
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

  function openEdit(sucursal: Sucursal) {
    setEditing(sucursal)
    setForm({
      id: sucursal.id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      codigo: sucursal.codigo,
      lat: sucursal.lat != null ? String(sucursal.lat) : '',
      lng: sucursal.lng != null ? String(sucursal.lng) : '',
      radio_m: String(sucursal.radio_m),
    })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.codigo.trim()) {
      setError('Nombre y código son obligatorios.')
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      codigo: form.codigo.trim().toUpperCase(),
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      radio_m: Number(form.radio_m) || 200,
    }

    try {
      setLoading(true)
      setError('')

      if (editing) {
        await updateSucursal(editing.id, payload)
        push('success', 'Sucursal actualizada.')
      } else {
        await createSucursal(payload)
        push('success', 'Sucursal creada.')
      }

      setOpen(false)
      load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la sucursal.'
      setError(message)
      push('error', message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(sucursal: Sucursal) {
    if (!window.confirm(`¿Eliminar la sucursal "${sucursal.nombre}"?`)) return
    try {
      await deleteSucursal(sucursal.id)
      push('success', 'Sucursal eliminada.')
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
                <h1 className="text-2xl font-bold text-ink">Sucursales</h1>
                <p className="text-sm text-ink-soft">
                  Sucursales y geofencing para el fichaje.
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Nueva sucursal
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-5">
          {sucursales.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border-subtle bg-surface p-10 text-center shadow-sm">
              <MapPin size={70} className="mx-auto mb-5 text-brand" />
              <h2 className="text-xl font-semibold text-ink">Todavía no hay sucursales</h2>
              <p className="mt-2 text-ink-soft">
                Creá una sucursal con su ubicación y los empleados podrán fichar solo
                dentro del radio permitido.
              </p>
              <button
                onClick={openCreate}
                className="mt-8 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                + Nueva sucursal
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sucursales.map((sucursal) => (
                <div
                  key={sucursal.id}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <img
                        src={qrUrl(sucursal.codigo)}
                        alt={`QR ${sucursal.nombre}`}
                        className="h-20 w-20 rounded-xl bg-white p-1"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-ink">{sucursal.nombre}</h3>
                        <p className="text-sm text-ink-soft">{sucursal.direccion || 'Sin dirección'}</p>
                        <p className="mt-1 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                          Código: {sucursal.codigo}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-soft">
                    {sucursal.lat != null && sucursal.lng != null ? (
                      <span className="rounded-full bg-surface-muted px-2 py-1">
                        {Number(sucursal.lat).toFixed(5)}, {Number(sucursal.lng).toFixed(5)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-muted px-2 py-1">Sin ubicación</span>
                    )}
                    <span className="rounded-full bg-surface-muted px-2 py-1">
                      Radio: {sucursal.radio_m} m
                    </span>
                    <span className="rounded-full bg-surface-muted px-2 py-1">
                      {sucursal.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEdit(sucursal)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 py-2 text-ink transition hover:bg-surface-muted"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sucursal)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-danger-soft px-3 py-2 text-danger transition hover:opacity-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 flex items-center gap-2 rounded-2xl bg-brand-soft p-4 text-sm text-ink">
            <QrCode className="h-5 w-5 shrink-0 text-brand" />
            Cada sucursal tiene su QR. Los empleados lo escanean o ingresan el código
            (con su PIN si lo tienen) para fichar sin GPS.
          </p>
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
                  {editing ? 'Editar sucursal' : 'Nueva sucursal'}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Configurá el geofence para el fichaje por ubicación.
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className={inputClasses}
                    placeholder="Sucursal Centro"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Dirección</label>
                  <input
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className={inputClasses}
                    placeholder="Av. Siempre Viva 742"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Código (para QR y PIN)
                  </label>
                  <input
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                    className={inputClasses}
                    placeholder="SUC-01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Latitud</label>
                    <input
                      value={form.lat}
                      onChange={(e) => setForm({ ...form, lat: e.target.value })}
                      className={inputClasses}
                      placeholder="-34.6037"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Longitud</label>
                    <input
                      value={form.lng}
                      onChange={(e) => setForm({ ...form, lng: e.target.value })}
                      className={inputClasses}
                      placeholder="-58.3816"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Radio permitido (metros)
                  </label>
                  <input
                    type="number"
                    value={form.radio_m}
                    onChange={(e) => setForm({ ...form, radio_m: e.target.value })}
                    className={inputClasses}
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
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear sucursal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
