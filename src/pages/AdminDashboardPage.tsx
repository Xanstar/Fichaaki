import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarDays, Clock3, Download, MapPin, ShieldCheck, UserX, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'
import {
  getAdminAttendance,
  getAttendanceByPeriod,
} from '../services/adminService'
import { supabase } from '../services/supabase'
import { AttendanceCard } from '../components/admin/AttendanceCard'
import { NovedadesPanel } from '../components/admin/NovedadesPanel'
import { useToasts } from '../hooks/useToasts'
import { ToastContainer } from '../components/Toast'
import { buildAttendanceCsv, downloadCsv } from '../services/reportes'
import { formatTime, todayISO, toISO } from '../utils/date'
import type { AttendanceRow, AttendanceStatus } from '../types'

type Periodo = 'dia' | 'semana' | 'mes'

interface AdminRow {
  employee: {
    id: string
    nombre: string
    apellido: string
    cargo: string
    rubro: string
  }
  history: AttendanceRow[]
}

interface ViewRecord {
  id: string
  employeeId: string
  employeeName: string
  cargo: string
  rubro: string
  fecha: string
  entrada: string | null
  salida: string | null
  horasTrabajadas: number | null
  estado: AttendanceStatus
  estadoFichaje: 'tarde' | 'a_tiempo' | null
  entradaLat: number | null
  entradaLng: number | null
  salidaLat: number | null
  salidaLng: number | null
  entradaDireccion: string | null
  salidaDireccion: string | null
  horasExtra: number | null
  observacion: string | null
}

const periodos: { id: Periodo; label: string }[] = [
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
]

function getWeekRange() {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return { start: toISO(monday), end: toISO(sunday) }
}

function getMonthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return { start: toISO(first), end: toISO(last) }
}

function toViewRecord(
  employee: AdminRow['employee'],
  record: AttendanceRow | null,
  fecha: string
): ViewRecord {
  return {
    id: record?.id ?? employee.id,
    employeeId: employee.id,
    employeeName: `${employee.nombre} ${employee.apellido}`,
    cargo: employee.cargo,
    rubro: employee.rubro,
    fecha: record?.fecha ?? fecha,
    entrada: formatTime(record?.entrada_at),
    salida: formatTime(record?.salida_at),
    horasTrabajadas: record?.horas_trabajadas ?? null,
    estado: (record?.estado ?? 'sin_registrar') as AttendanceStatus,
    estadoFichaje: record
      ? record.llegada_tarde
        ? 'tarde'
        : 'a_tiempo'
      : null,
    entradaLat: record?.entrada_lat ?? null,
    entradaLng: record?.entrada_lng ?? null,
    salidaLat: record?.salida_lat ?? null,
    salidaLng: record?.salida_lng ?? null,
    entradaDireccion: record?.entrada_direccion ?? null,
    salidaDireccion: record?.salida_direccion ?? null,
    horasExtra: record?.horas_extra ?? null,
    observacion: record?.observacion ?? null,
  }
}

export function AdminDashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()

  const [periodo, setPeriodo] = useState<Periodo>('dia')
  const [weekDay, setWeekDay] = useState('')
  const [month, setMonth] = useState('')
  const [monthDay, setMonthDay] = useState('')

  const [rows, setRows] = useState<AdminRow[]>([])

  const loadAttendance = useCallback(async () => {
    try {
      let data: AdminRow[] = []

      if (periodo === 'dia') {
        data = await getAdminAttendance()
      } else if (periodo === 'semana') {
        const week = getWeekRange()
        data = await getAttendanceByPeriod(week.start, week.end)
      } else {
        const range = getMonthRange()
        data = await getAttendanceByPeriod(range.start, range.end)
      }

      setRows(data)
    } catch (err) {
      console.error(err)
    }
  }, [periodo])

  useEffect(() => {
    loadAttendance()

    const channel = supabase
      .channel('attendance-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
        },
        () => loadAttendance()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAttendance])

  const referenceDate = useMemo(() => {
    const latest = rows
      .flatMap((row) => row.history.map((record) => record.fecha))
      .sort()
      .at(-1)

    return latest ?? todayISO()
  }, [rows])

  const selectedWeekDay = weekDay || referenceDate
  const selectedMonth = month || referenceDate.slice(0, 7)
  const selectedMonthDay = monthDay || referenceDate.slice(8, 10)

  const selectedDate =
    periodo === 'dia'
      ? referenceDate
      : periodo === 'semana'
        ? selectedWeekDay
        : `${selectedMonth}-${selectedMonthDay}`

  const records = useMemo(() => {
    const view = rows.map((row) => {
      const record = row.history.find(
        (item) => item.fecha === selectedDate
      )

      return toViewRecord(row.employee, record ?? null, selectedDate)
    })

    return view.sort((a, b) => {
      if (a.estado === 'trabajando' && b.estado !== 'trabajando') return -1
      if (a.estado !== 'trabajando' && b.estado === 'trabajando') return 1

      if (a.entrada && !b.entrada) return -1
      if (!a.entrada && b.entrada) return 1

      if (!a.entrada && !b.entrada) {
        return a.employeeName.localeCompare(b.employeeName)
      }

      return (a.entrada ?? '').localeCompare(b.entrada ?? '')
    })
  }, [rows, selectedDate])

  const metrics = useMemo(
    () => ({
      empleados: records.length,
      enCurso: records.filter((r) => r.estado === 'trabajando').length,
      tardanzas: records.filter((r) => r.estadoFichaje === 'tarde').length,
      ausentes: records.filter((r) => r.estado === 'sin_registrar').length,
    }),
    [records]
  )

  const titulo =
    periodo === 'dia'
      ? 'Fichadas del día'
      : periodo === 'semana'
        ? 'Fichadas por día'
        : 'Fichadas por fecha'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleExport() {
    const csv = buildAttendanceCsv(rows)
    const fechaLabel = selectedDate.replace(/-/g, '')
    downloadCsv(`fichaqui-reporte-${fechaLabel}.csv`, csv)
    push('success', 'Reporte CSV descargado.')
  }

  const metricCards = [
    { label: 'Personas', value: metrics.empleados, Icon: Users, color: 'text-brand' },
    { label: 'En curso', value: metrics.enCurso, Icon: Clock3, color: 'text-success' },
    { label: 'Tardanzas', value: metrics.tardanzas, Icon: AlertTriangle, color: 'text-danger' },
    { label: 'Ausentes', value: metrics.ausentes, Icon: UserX, color: 'text-ink-soft' },
  ]

  return (
    <div className="min-h-screen bg-surface-muted pb-16">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden border-l border-border-subtle pl-3 text-sm font-medium text-ink-soft sm:block">
              Administración
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <NovedadesPanel onNew={(mensaje) => push('info', mensaje)} />
            <button
              onClick={() => navigate('/admin/empleados')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              <Users size={16} />
              Empleados
            </button>
            <button
              onClick={() => navigate('/admin/sucursales')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              <MapPin size={16} />
              Sucursales
            </button>
            <button
              onClick={() => navigate('/admin/turnos')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              <Clock3 size={16} />
              Turnos
            </button>
            <button
              onClick={() => navigate('/admin/licencias')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              <CalendarDays size={16} />
              Licencias
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5 sm:px-5 sm:pt-8">
        <ToastContainer toasts={toasts} onClose={dismiss} />
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border-subtle bg-gradient-to-br from-brand-soft via-surface to-surface-muted p-5 shadow-sm shadow-ink/[0.03] sm:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-medium text-brand">
              <ShieldCheck className="h-4 w-4" /> Panel administrativo
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              Control de asistencia
            </h1>
            <p className="mt-1 text-sm text-ink-soft">Resumen operativo del equipo.</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-right text-sm text-ink-soft">
            <p className="font-semibold text-ink">Hoy</p>
            <p>
              {new Date(`${referenceDate}T00:00:00`).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
          {metricCards.map(({ label, value, Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-ink-soft">{label}</p>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-[28px] border border-border-subtle bg-surface p-4 shadow-sm shadow-ink/[0.03] sm:mt-8 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success transition hover:bg-success hover:text-white"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
            <div className="flex w-full rounded-xl bg-surface-muted p-1 sm:w-auto">
              {periodos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPeriodo(item.id)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none ${
                    periodo === item.id
                      ? 'bg-surface text-brand shadow-sm'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {periodo === 'semana' && (
            <label className="mt-4 block rounded-2xl bg-brand-soft p-3 text-sm font-semibold text-ink sm:flex sm:items-center sm:gap-4">
              Día a revisar
              <input
                type="date"
                value={selectedWeekDay}
                onChange={(event) => setWeekDay(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 font-medium outline-none focus:border-brand sm:mt-0 sm:w-auto"
              />
            </label>
          )}

          {periodo === 'mes' && (
            <div className="mt-4 grid gap-3 rounded-2xl bg-brand-soft p-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink">
                Mes
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setMonth(event.target.value)}
                  className="mt-2 block w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 font-medium outline-none focus:border-brand"
                />
              </label>
              <label className="text-sm font-semibold text-ink">
                Día
                <select
                  value={selectedMonthDay}
                  onChange={(event) => setMonthDay(event.target.value)}
                  className="mt-2 block w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 font-medium outline-none focus:border-brand"
                >
                  {Array.from({ length: 31 }, (_, index) =>
                    String(index + 1).padStart(2, '0')
                  ).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {records.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-muted px-4 py-10 text-center text-sm text-ink-soft">
                No hay fichadas para esta fecha.
              </div>
            ) : (
              records.map((record) => (
                <AttendanceCard key={record.id} record={record} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
