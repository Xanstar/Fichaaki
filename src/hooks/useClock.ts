import { useEffect, useState } from 'react'

const AR_TZ = 'America/Argentina/Buenos_Aires'

export function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: AR_TZ,
  })

  const date = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: AR_TZ,
  })

  return { now, time, date }
}
