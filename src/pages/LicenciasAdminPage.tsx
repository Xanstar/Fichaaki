import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarOff, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  actualizarLicencia,
  getLicenciasAdmin,
} from '../services/licenciasService'
import type { Licencia } from '../types'
import { useToasts } from '../hooks/useToasts'
import { ToastContainer } from '../components/Toast'

const tipoLabel: Record<string, string> = {
  vacaciones: 'Vacaciones',
  enfermedad: 'Enfermedad',
  personal: 'Personal',
  estudio: 'Estudio',
  otro: 'Otro',
}

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

export function LicenciasAdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()

  const [licencias, setLicencias] = useState<Awaited<ReturnType<typeof getLicenciasAdmin>>>([])

  async function load() {
    try {
      setLicencias(await getLicenciasAdmin())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleEstado(id: string, estado: 'aprobada' | 'rechazada') {
    if (!user) return
    try {
      await actualizarLicencia(id, estado, user.id)
      push('success', estado === 'aprobada' ? 'Licencia aprobada.' : 'Licencia rechazada.')
      load()
    } catch (err) {
      push('error', err instanceof Error ? err.message : 'No se pudo actualizar.')
    }
  }

  const pendientes = licencias.filter((licencia) => licencia.estado === 'pendiente').length

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
                <h1 className="text-2xl font-bold text-ink">Licencias y ausencias</h1>
                <p className="text-sm text-ink-soft">
                  Solicitudes de licencia de los empleados.
                </p>
              </div>
            </div>

            {pendientes > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-600">
                {pendientes} pendiente{pendientes > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-5">
          {licencias.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border-subtle bg-surface p-10 text-center shadow-sm">
              <CalendarOff size={70} className="mx-auto mb-5 text-brand" />
              <h2 className="text-xl font-semibold text-ink">Sin solicitudes</h2>
              <p className="mt-2 text-ink-soft">
                Cuando un empleado pida una licencia aparecerá acá para que la apruebes.
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
                          {licencia.profiles?.nombre ?? 'Empleado'}{' '}
                          {licencia.profiles?.apellido ?? ''}
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
                        {tipoLabel[licencia.tipo] ?? licencia.tipo} ·{' '}
                        {licencia.fecha_inicio} al {licencia.fecha_fin}
                      </p>

                      {licencia.motivo && (
                        <p className="mt-2 text-sm text-ink">{licencia.motivo}</p>
                      )}
                    </div>

                    {licencia.estado === 'pendiente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEstado(licencia.id, 'aprobada')}
                          className="flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          <Check size={16} />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleEstado(licencia.id, 'rechazada')}
                          className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          <X size={16} />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={dismiss} />
    </>
  )
}
