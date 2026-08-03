export type UserRole = 'employee' | 'admin'

export interface AuthUser {
  id: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  rol: UserRole
  companyId: string
}

export type AttendanceStatus = 'sin_registrar' | 'trabajando' | 'finalizada'

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
