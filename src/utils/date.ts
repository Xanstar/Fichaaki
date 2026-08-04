const AR_TZ = 'America/Argentina/Buenos_Aires'

export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: AR_TZ }).format(new Date())
}

export function toISO(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: AR_TZ }).format(date)
}

export function formatTime(date: string | Date | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: AR_TZ,
  })
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: AR_TZ,
  })
}

export function formatDuration(hours: number | null | undefined) {
  if (hours == null) return '—'

  if (hours < 1) return `${Math.round(hours * 60)} min`

  return `${hours.toFixed(1)} h`
}
