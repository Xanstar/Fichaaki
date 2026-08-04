import type { AttendanceRowWithEmployee } from './adminService'
import { formatTime } from '../utils/date'

function estadoLabel(estado: AttendanceRowWithEmployee['history'][number]['estado']) {
  if (estado === 'trabajando') return 'En curso'
  if (estado === 'finalizada') return 'Finalizada'
  return 'Pendiente'
}

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function buildAttendanceCsv(rows: AttendanceRowWithEmployee[]) {
  const header = [
    'Empleado',
    'Cargo',
    'Rubro',
    'Fecha',
    'Entrada',
    'Salida',
    'Horas trabajadas',
    'Horas extra',
    'Minutos tarde',
    'Estado',
    'Dirección entrada',
    'Dirección salida',
    'Observación',
  ]

  const lines: string[] = [header.map(csvCell).join(';')]

  for (const row of rows) {
    const empleado = `${row.employee.nombre} ${row.employee.apellido}`.trim()

    if (row.history.length === 0) {
      lines.push(
        [
          empleado,
          row.employee.cargo,
          row.employee.rubro,
          '—',
          '',
          '',
          '',
          '',
          '',
          'Sin fichadas',
          '',
          '',
          '',
        ].map(csvCell).join(';')
      )
      continue
    }

    for (const record of row.history) {
      lines.push(
        [
          empleado,
          row.employee.cargo,
          row.employee.rubro,
          record.fecha,
          formatTime(record.entrada_at),
          formatTime(record.salida_at),
          record.horas_trabajadas,
          record.horas_extra,
          record.minutos_tarde,
          estadoLabel(record.estado),
          record.entrada_direccion,
          record.salida_direccion,
          record.observacion,
        ].map(csvCell).join(';')
      )
    }
  }

  return '\uFEFF' + lines.join('\n')
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
