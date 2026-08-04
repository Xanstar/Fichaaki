import { supabase } from './supabase'
import { todayISO } from '../utils/date'
import type { AttendanceRow, EmployeeProfile } from '../types'

export interface AttendanceRowWithEmployee {
  employee: Pick<EmployeeProfile, 'id' | 'nombre' | 'apellido' | 'cargo' | 'rubro'>
  history: AttendanceRow[]
}

export async function getAdminAttendance() {
  const today = todayISO()

  return getAttendanceByPeriod(today, today)
}

export async function getAttendanceByPeriod(
  start: string,
  end: string
): Promise<AttendanceRowWithEmployee[]> {
  const { data: employees, error: employeesError } = await supabase
    .from('profiles')
    .select('id, nombre, apellido, cargo, rubro')
    .eq('rol', 'employee')
    .order('nombre')

  if (employeesError) throw employeesError

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance_records')
    .select('*')
    .gte('fecha', start)
    .lte('fecha', end)
    .order('fecha', { ascending: false })

  if (attendanceError) throw attendanceError

  const allAttendance = (attendance ?? []) as AttendanceRow[]

  return (employees ?? []).map((employee) => ({
    employee: {
      id: employee.id,
      nombre: employee.nombre,
      apellido: employee.apellido,
      cargo: employee.cargo,
      rubro: employee.rubro,
    },
    history: allAttendance.filter(
      (record) => record.employee_id === employee.id
    ),
  }))
}
