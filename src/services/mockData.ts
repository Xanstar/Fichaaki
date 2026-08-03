import type { AuthUser, AttendanceRecord } from '../types'

export interface AdminAttendanceRecord extends AttendanceRecord {
  employeeId: string
  employeeName: string
  cargo: string
}

export const mockEmployee: AuthUser = {
  id: 'u-001',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan.perez@empresa.com',
  cargo: 'Analista de Soporte',
  rol: 'employee',
  companyId: 'c-001',
}

// Historial simulado, más reciente primero. "Hoy" se agrega dinámicamente en runtime.
export const mockHistory: AttendanceRecord[] = [
  {
    id: 'a-1006',
    fecha: '2026-07-31',
    entrada: '08:58',
    salida: '18:04',
    horasTrabajadas: 9.1,
    estado: 'finalizada',
  },
  {
    id: 'a-1005',
    fecha: '2026-07-30',
    entrada: '09:05',
    salida: '17:59',
    horasTrabajadas: 8.9,
    estado: 'finalizada',
  },
  {
    id: 'a-1004',
    fecha: '2026-07-29',
    entrada: '08:55',
    salida: '18:12',
    horasTrabajadas: 9.3,
    estado: 'finalizada',
  },
  {
    id: 'a-1003',
    fecha: '2026-07-28',
    entrada: '09:00',
    salida: '17:45',
    horasTrabajadas: 8.75,
    estado: 'finalizada',
  },
  {
    id: 'a-1002',
    fecha: '2026-07-25',
    entrada: '09:10',
    salida: '18:00',
    horasTrabajadas: 8.83,
    estado: 'finalizada',
  },
]

export const mockAdminAttendance: AdminAttendanceRecord[] = [
  {
    id: 'adm-001',
    employeeId: 'u-001',
    employeeName: 'Juan Pérez',
    cargo: 'Analista de Soporte',
    fecha: '2026-08-01',
    entrada: '08:55',
    salida: '18:05',
    horasTrabajadas: 9.17,
    estado: 'finalizada',
    ubicacionEntrada: 'Lat -34.6037 · Lon -58.3816',
    ubicacionSalida: 'Lat -34.6094 · Lon -58.3745',
  },
  {
    id: 'adm-002',
    employeeId: 'u-002',
    employeeName: 'María Gómez',
    cargo: 'Coordinadora de RRHH',
    fecha: '2026-08-01',
    entrada: '08:40',
    salida: null,
    horasTrabajadas: null,
    estado: 'trabajando',
    ubicacionEntrada: 'Lat -34.5978 · Lon -58.3933',
  },
  {
    id: 'adm-003',
    employeeId: 'u-003',
    employeeName: 'Carlos Ruiz',
    cargo: 'Desarrollador Frontend',
    fecha: '2026-07-31',
    entrada: '09:10',
    salida: '17:50',
    horasTrabajadas: 8.67,
    estado: 'finalizada',
    ubicacionEntrada: 'Lat -34.6118 · Lon -58.4173',
    ubicacionSalida: 'Lat -34.6180 · Lon -58.4068',
  },
  {
    id: 'adm-004',
    employeeId: 'u-004',
    employeeName: 'Sofía Díaz',
    cargo: 'Recepción',
    fecha: '2026-08-01',
    entrada: null,
    salida: null,
    horasTrabajadas: null,
    estado: 'sin_registrar',
  },
]
