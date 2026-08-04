import type { AttendanceStatus } from '../types'
import { Button } from './Button'

interface StatusCardProps {
  estado: AttendanceStatus
  entrada: string | null
  salida: string | null
  entradaTimestamp?: string | null
  salidaTimestamp?: string | null
  ubicacionEntrada?: string | null
  ubicacionSalida?: string | null
  isSubmitting: boolean
  justChecked: boolean
  estadoFichaje?: 'a_tiempo' | 'tarde' | null
  onCheckIn: () => void
  onCheckOut: () => void
}

const statusMeta: Record<AttendanceStatus, { label: string; helper: string; dot: string }> = {
  sin_registrar: { label: 'Jornada sin iniciar', helper: 'Marcá tu entrada para comenzar.', dot: 'bg-ink-soft/40' },
  trabajando: { label: 'Jornada en curso', helper: 'Recordá marcar la salida al finalizar.', dot: 'bg-success animate-pulse-dot' },
  finalizada: { label: 'Jornada finalizada', helper: 'Tus registros de hoy están completos.', dot: 'bg-brand' },
}

function LocationDetail({ label, time, timestamp, location }: { label: string; time: string | null; timestamp?: string | null; location?: string | null }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-muted p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className="font-display text-lg font-bold text-ink">{time ?? '—'}</p>
      </div>
      {timestamp ? <p className="mt-2 text-xs text-ink-soft">Registrada: {timestamp}</p> : <p className="mt-2 text-xs text-ink-soft">Aún sin registrar</p>}
      {location ? <p className="mt-1.5 break-words text-xs font-medium text-ink">Ubicación: {location}</p> : <p className="mt-1.5 text-xs text-ink-soft">Ubicación pendiente</p>}
    </div>
  )
}

export function StatusCard({ estado, entrada, salida, entradaTimestamp, salidaTimestamp, ubicacionEntrada, ubicacionSalida, isSubmitting, justChecked, estadoFichaje, onCheckIn, onCheckOut }: StatusCardProps) {
  const meta = statusMeta[estado]
  const isCheckingOut = estado === 'trabajando'

  return (
    <section className="rounded-[28px] border border-border-subtle bg-surface p-5 shadow-sm shadow-ink/[0.03] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
            <span className="text-sm font-semibold text-ink">{meta.label}</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">{meta.helper}</p>
        </div>
        {estadoFichaje && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoFichaje === 'tarde' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}>
            {estadoFichaje === 'tarde' ? 'Llegada tarde' : 'A tiempo'}
          </span>
        )}
      </div>

      {estado !== 'finalizada' ? (
        <div className="my-6 flex justify-center">
          <Button
            variant={isCheckingOut ? 'danger' : 'success'}
            disabled={isSubmitting}
            onClick={isCheckingOut ? onCheckOut : onCheckIn}
            className="h-52 w-52 !rounded-full p-6 text-xl shadow-lg sm:h-60 sm:w-60 sm:text-2xl"
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="text-3xl">{isCheckingOut ? '↑' : '↓'}</span>
              <span>Marcar {isCheckingOut ? 'salida' : 'entrada'}</span>
              <span className="mt-1 text-xs font-medium opacity-80">{isCheckingOut ? 'Finalizar jornada' : 'Iniciar jornada'}</span>
            </span>
          </Button>
        </div>
      ) : (
        <div className="my-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
            <svg className={justChecked ? 'animate-check-pop' : ''} width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      <div className="border-t border-border-subtle pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Registro de hoy</h2>
          <span className="text-xs text-ink-soft">Entrada y salida</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <LocationDetail label="Entrada" time={entrada} timestamp={entradaTimestamp} location={ubicacionEntrada} />
          <LocationDetail label="Salida" time={salida} timestamp={salidaTimestamp} location={ubicacionSalida} />
        </div>
      </div>
    </section>
  )
}
