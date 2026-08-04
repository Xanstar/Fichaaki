export type UserRole = 'employee' | 'admin'

export interface AuthUser {
  id: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  rol: UserRole
}

export type AttendanceStatus = 'sin_registrar' | 'trabajando' | 'finalizada'

export interface AttendanceRow {
  id: string
  employee_id: string
  fecha: string
  entrada_at: string | null
  salida_at: string | null
  entrada_lat: number | null
  entrada_lng: number | null
  salida_lat: number | null
  salida_lng: number | null
  entrada_direccion: string | null
  salida_direccion: string | null
  estado: AttendanceStatus
  horas_trabajadas: number | null
  llegada_tarde: boolean
  minutos_tarde: number
}

export interface EmployeeProfile {
  id: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  rubro: string
  jornada_inicio: string
  jornada_fin: string
}


export interface AttendanceRecord {
  id: string
  fecha: string // ISO date, e.g. 2026-08-01
  entrada: string | null // HH:mm
  salida: string | null // HH:mm
  horasTrabajadas: number | null
  segundosTrabajados?: number | null
  estado: AttendanceStatus
  observaciones?: string
  timestamp?: string | null
  entradaTimestamp?: string | null
  salidaTimestamp?: string | null
  entradaEpoch?: number | null
  ubicacionEntrada?: string | null
  ubicacionSalida?: string | null
  ubicacion?: string | null
  estadoFichaje?: 'a_tiempo' | 'tarde' | null
}
