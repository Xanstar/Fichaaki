import { AlertTriangle, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDuration } from '../../utils/date'

interface AttendanceCardRecord {
  employeeName: string
  cargo: string
  rubro: string
  estado: string
  entrada: string | null
  salida: string | null
  horasTrabajadas: number | null
  estadoFichaje: 'tarde' | 'a_tiempo' | null
  entradaLat?: number | null
  entradaLng?: number | null
  salidaLat?: number | null
  salidaLng?: number | null
  entradaDireccion?: string | null
  salidaDireccion?: string | null
}

function estadoLabel(estado: string) {
  if (estado === 'trabajando') return 'En curso'
  if (estado === 'finalizada') return 'Finalizada'
  return 'Pendiente'
}

function estadoClase(estado: string) {
  if (estado === 'trabajando') return 'bg-success-soft text-success'
  if (estado === 'finalizada') return 'bg-brand-soft text-brand'
  return 'bg-surface-muted text-ink-soft'
}

function googleMapsUrl(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return null

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

const avatarColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
]

export function AttendanceCard({ record }: { record: AttendanceCardRecord }) {
  const avatarColor =
    avatarColors[record.employeeName.length % avatarColors.length]

  const entradaUrl = googleMapsUrl(record.entradaLat, record.entradaLng)
  const salidaUrl = googleMapsUrl(record.salidaLat, record.salidaLng)

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm ${avatarColor}`}
          >
            {record.employeeName
              ?.split(' ')
              .map((word) => word[0])
              .slice(0, 2)
              .join('')}
          </div>

          <div>
            <h3 className="text-lg font-bold text-ink">{record.employeeName}</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {record.cargo}
              {record.rubro ? ` · ${record.rubro}` : ''}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(record.estado)}`}
        >
          {estadoLabel(record.estado)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 items-center gap-2 rounded-2xl bg-surface-muted p-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Entrada</p>
          <p className="mt-1 text-xl font-bold text-ink">{record.entrada ?? '--:--'}</p>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Salida</p>
          <p className="mt-1 text-xl font-bold text-ink">{record.salida ?? '--:--'}</p>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Horas</p>
          <p className="mt-1 text-xl font-bold text-ink">
            {formatDuration(record.horasTrabajadas)}
          </p>
        </div>
      </div>

      {record.estadoFichaje === 'tarde' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-danger-soft px-3 py-1 text-sm font-medium text-danger">
            <AlertTriangle size={15} />
            Llegó tarde
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {entradaUrl ? (
          <a
            href={entradaUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-success-soft py-2.5 font-semibold text-success transition hover:bg-success hover:text-white"
          >
            <MapPin size={16} />
            Ver entrada
          </a>
        ) : (
          <button
            disabled
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-surface-muted py-2.5 font-semibold text-ink-soft/60"
          >
            <MapPin size={16} />
            Ver entrada
          </button>
        )}

        {salidaUrl ? (
          <a
            href={salidaUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-soft py-2.5 font-semibold text-brand transition hover:bg-brand hover:text-white"
          >
            <MapPin size={16} />
            Ver salida
          </a>
        ) : (
          <button
            disabled
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-surface-muted py-2.5 font-semibold text-ink-soft/60"
          >
            <MapPin size={16} />
            Ver salida
          </button>
        )}
      </div>

      {(record.entradaDireccion || record.salidaDireccion) && (
        <div className="mt-3 flex flex-col gap-1 border-t border-border-subtle pt-3 text-xs text-ink-soft">
          {record.entradaDireccion && (
            <p className="break-words">
              <span className="font-semibold text-ink">Entrada:</span>{' '}
              {record.entradaDireccion}
            </p>
          )}
          {record.salidaDireccion && (
            <p className="break-words">
              <span className="font-semibold text-ink">Salida:</span>{' '}
              {record.salidaDireccion}
            </p>
          )}
        </div>
      )}
    </motion.article>
  )
}
