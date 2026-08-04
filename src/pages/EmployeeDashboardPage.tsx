import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useClock } from '../hooks/useClock'
import { useToasts } from '../hooks/useToasts'
import { ToastContainer } from '../components/Toast'
import { StatusCard } from '../components/StatusCard'
import { AttendanceHistoryCard } from '../components/AttendanceHistoryCard'
import { CheckInModal, type CheckInPayload } from '../components/CheckInModal'
import { Logo } from '../components/Logo'
import {
  getTodayAttendance,
  getAttendanceHistory,
  checkIn,
  checkOut,
} from '../services/attendanceService'
import { reverseGeocode } from '../services/geocode'
import { formatDateTime, formatTime, todayISO } from '../utils/date'
import type { AttendanceRecord, AttendanceRow, AttendanceStatus } from '../types'

function locationLabel(lat: number | null | undefined, lng: number | null | undefined) {
  if (lat == null || lng == null) return null
  return `Lat ${lat.toFixed(4)} · Lon ${lng.toFixed(4)}`
}

function toAttendanceRecord(record: AttendanceRow): AttendanceRecord {
  return {
    id: record.id,
    fecha: record.fecha,
    entrada: formatTime(record.entrada_at),
    salida: formatTime(record.salida_at),
    horasTrabajadas: record.horas_trabajadas ?? null,
    horasExtra: record.horas_extra ?? null,
    observacion: record.observacion ?? null,
    estado: record.estado,
    entradaTimestamp: formatDateTime(record.entrada_at),
    salidaTimestamp: formatDateTime(record.salida_at),
    ubicacionEntrada: record.entrada_direccion ?? locationLabel(record.entrada_lat, record.entrada_lng),
    ubicacionSalida: record.salida_direccion ?? locationLabel(record.salida_lat, record.salida_lng),
    estadoFichaje: record.llegada_tarde ? 'tarde' : 'a_tiempo',
  }
}

type PendingAction = 'entrada' | 'salida'

export function EmployeeDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { time, date } = useClock()
  const { toasts, push, dismiss } = useToasts()

  const [today, setToday] = useState<AttendanceRecord>({
    id: '',
    fecha: todayISO(),
    entrada: null,
    salida: null,
    horasTrabajadas: null,
    estado: 'sin_registrar' as AttendanceStatus,
  })

  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justChecked, setJustChecked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>('entrada')

  useEffect(() => {
    async function loadAttendance() {
      if (!user) return

      try {
        const todayRecord = await getTodayAttendance(user.id)

        if (todayRecord) {
          setToday(toAttendanceRecord(todayRecord))
        }

        const historyData = await getAttendanceHistory(user.id)

        if (historyData) {
          setHistory(historyData.map(toAttendanceRecord))
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadAttendance()
  }, [user])

  function flashCheck() {
    setJustChecked(true)
    setTimeout(() => setJustChecked(false), 900)
  }

  async function getPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
      })
    )
  }

  function handleCheckIn() {
    setPendingAction('entrada')
    setModalOpen(true)
  }

  function handleCheckOut() {
    setPendingAction('salida')
    setModalOpen(true)
  }

  async function handleConfirm(payload: CheckInPayload) {
    setIsSubmitting(true)

    try {
      const common = { observacion: payload.observacion }

      if (payload.useCode) {
        const data = await (pendingAction === 'entrada'
          ? checkIn({ ...common, codigoSucursal: payload.codigoSucursal, pin: payload.pin })
          : checkOut({ ...common, codigoSucursal: payload.codigoSucursal, pin: payload.pin }))

        setToday(toAttendanceRecord(data))
        setModalOpen(false)
        flashCheck()
        push(
          'success',
          pendingAction === 'entrada'
            ? 'Entrada registrada con el código de sucursal.'
            : 'Salida registrada con el código de sucursal.'
        )
        return
      }

      const position = await getPosition()
      const direccion = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      )

      const data = await (pendingAction === 'entrada'
        ? checkIn({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            direccion: direccion ?? undefined,
            ...common,
          })
        : checkOut({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            direccion: direccion ?? undefined,
            ...common,
          }))

      setToday(toAttendanceRecord(data))
      setModalOpen(false)
      flashCheck()
      push('success', pendingAction === 'entrada' ? 'Entrada registrada correctamente.' : 'Salida registrada correctamente.')
    } catch (err) {
      console.error(err)
      push(
        'error',
        err instanceof Error ? err.message : 'No se pudo registrar la fichada.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface-muted pb-16">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <header className="border-b border-border-subtle bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/empleado/licencias')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              <CalendarDays size={16} />
              Licencias
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5 sm:px-5 sm:pt-8">
        <section className="rounded-[28px] border border-border-subtle bg-surface p-5 shadow-sm shadow-ink/[0.03] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-soft">{date}</p>
              <h1 className="mt-1 text-2xl font-bold text-ink">
                Hola, {user?.nombre ?? 'Empleado'}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                Tu jornada y fichadas de hoy.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-soft px-3 py-2 text-right">
              <p className="font-display text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
                {time}
              </p>
              <p className="text-xs font-medium text-brand/70">Hora actual</p>
            </div>
          </div>
        </section>

        <div className="mt-4 sm:mt-6">
          <StatusCard
            estado={today.estado}
            entrada={today.entrada}
            salida={today.salida}
            entradaTimestamp={today.entradaTimestamp}
            salidaTimestamp={today.salidaTimestamp}
            ubicacionEntrada={today.ubicacionEntrada}
            ubicacionSalida={today.ubicacionSalida}
            isSubmitting={isSubmitting}
            justChecked={justChecked}
            estadoFichaje={today.estadoFichaje}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>

        <section className="mt-8 sm:mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Historial de jornadas
          </h2>
          <div className="flex flex-col gap-2.5">
            {today.estado === 'finalizada' && (
              <AttendanceHistoryCard record={today} />
            )}
            {history
              .filter((record) => record.fecha !== today.fecha)
              .map((record) => (
                <AttendanceHistoryCard key={record.id} record={record} />
              ))}
          </div>
        </section>
      </main>

      <CheckInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        action={pendingAction}
        loading={isSubmitting}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
