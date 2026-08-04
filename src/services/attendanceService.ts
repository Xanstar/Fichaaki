import { supabase } from './supabase'
import { todayISO } from '../utils/date'
import { invokeEdgeFunction } from './edge'

export async function getTodayAttendance(employeeId: string) {
  const today = todayISO()

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('fecha', today)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function getAttendanceHistory(employeeId: string) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .order('fecha', { ascending: false })
    .limit(30)

  if (error) throw error

  return data
}

export interface CheckInPayload {
  lat?: number
  lng?: number
  direccion?: string
  observacion?: string
  codigoSucursal?: string
  pin?: string
}

export async function checkIn(data: CheckInPayload) {
  const result = await invokeEdgeFunction('check-in', data)
  return result.attendance
}

export async function checkOut(data: CheckInPayload) {
  const result = await invokeEdgeFunction('check-out', data)
  return result.attendance
}
