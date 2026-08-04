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
  horas_extra: number | null
  observacion: string | null
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
  sucursal_id: string | null
  turno_id: string | null
  pin: string | null
  activo: boolean
}

export interface Sucursal {
  id: string
  nombre: string
  direccion: string
  codigo: string
  lat: number | null
  lng: number | null
  radio_m: number
  activo: boolean
  created_at: string
}

export interface Turno {
  id: string
  nombre: string
  jornada_inicio: string
  jornada_fin: string
  activo: boolean
  created_at: string
}

export type LicenciaEstado = 'pendiente' | 'aprobada' | 'rechazada'

export interface Licencia {
  id: string
  employee_id: string
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  motivo: string
  estado: LicenciaEstado
  revisado_por: string | null
  created_at: string
  employee_nombre?: string
}

export interface Notificacion {
  id: string
  employee_id: string
  tipo: string
  mensaje: string
  leida: boolean
  fecha: string
  created_at: string
}


export interface AttendanceRecord {
  id: string
  fecha: string // ISO date, e.g. 2026-08-01
  entrada: string | null // HH:mm
  salida: string | null // HH:mm
  horasTrabajadas: number | null
  horasExtra?: number | null
  observacion?: string | null
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
