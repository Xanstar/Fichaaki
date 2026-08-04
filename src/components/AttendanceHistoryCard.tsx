import type { AttendanceRecord } from '../types'

function formatFecha(fecha: string) {
  const [year, month, day] = fecha.split('-').map(Number)
  const d = new Date(year, month - 1, day)

  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatDuration(record: AttendanceRecord) {
  if (record.segundosTrabajados != null) {
    const hours = Math.floor(record.segundosTrabajados / 3600)
    const minutes = Math.floor((record.segundosTrabajados % 3600) / 60)
    const seconds = record.segundosTrabajados % 60

    if (hours > 0) return `${hours} h ${minutes} min`
    if (minutes > 0) return `${minutes} min ${seconds} s`
    return `${seconds} s`
  }

  return record.horasTrabajadas != null
    ? `${record.horasTrabajadas.toFixed(1)} hs`
    : '—'
}

function estadoBadge(estado: AttendanceRecord['estado']) {
  if (estado === 'trabajando') {
    return { label: 'En curso', className: 'bg-brand-soft text-brand' }
  }

  return { label: 'Completo', className: 'bg-success-soft text-success' }
}

export function AttendanceHistoryCard({ record }: { record: AttendanceRecord }) {
  const badge = estadoBadge(record.estado)

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface px-5 py-4">
      <div>
        <p className="text-sm font-semibold capitalize text-ink">
          {formatFecha(record.fecha)}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {record.entrada ?? '—'} · {record.salida ?? '—'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-ink">{formatDuration(record)}</p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
        {record.horasExtra != null && record.horasExtra > 0 && (
          <p className="mt-1 text-[11px] font-semibold text-amber-600">
            +{record.horasExtra} h extra
          </p>
        )}
        {record.estadoFichaje && (
          <p
            className={`mt-2 text-[11px] font-semibold ${
              record.estadoFichaje === 'tarde' ? 'text-danger' : 'text-success'
            }`}
          >
            {record.estadoFichaje === 'tarde' ? 'Tarde' : 'A tiempo'}
          </p>
        )}
        {record.entradaTimestamp && (
          <p className="text-[11px] text-ink-soft">Entrada: {record.entradaTimestamp}</p>
        )}
        {record.ubicacionEntrada && (
          <p className="break-words text-[11px] font-medium text-ink">
            Entrada en {record.ubicacionEntrada}
          </p>
        )}
        {record.salidaTimestamp && (
          <p className="text-[11px] text-ink-soft">Salida: {record.salidaTimestamp}</p>
        )}
        {record.ubicacionSalida && (
          <p className="break-words text-[11px] font-medium text-ink">
            Salida en {record.ubicacionSalida}
          </p>
        )}
        {record.timestamp && !record.entradaTimestamp && !record.salidaTimestamp && (
          <p className="text-[11px] text-ink-soft">{record.timestamp}</p>
        )}
        {record.ubicacion && <p className="text-[11px] text-ink-soft">{record.ubicacion}</p>}
        {record.observacion && (
          <p className="mt-1 rounded-lg bg-surface-muted px-2 py-1 text-[11px] text-ink">
            {record.observacion}
          </p>
        )}
      </div>
    </div>
  )
}
