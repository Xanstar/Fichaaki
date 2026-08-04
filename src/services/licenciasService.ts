import { supabase } from './supabase'
import type { Licencia } from '../types'

export async function getMisLicencias(employeeId: string) {
  const { data, error } = await supabase
    .from('licencias')
    .select('*')
    .eq('employee_id', employeeId)
    .order('fecha_inicio', { ascending: false })

  if (error) throw error

  return (data ?? []) as Licencia[]
}

export async function solicitarLicencia(input: {
  employee_id: string
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  motivo: string
}) {
  const { data, error } = await supabase
    .from('licencias')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  return data as Licencia
}

export async function getLicenciasAdmin() {
  const { data, error } = await supabase
    .from('licencias')
    .select('*, profiles(nombre, apellido)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as (Licencia & {
    profiles: { nombre: string; apellido: string } | null
  })[]
}

export async function actualizarLicencia(
  id: string,
  estado: Licencia['estado'],
  adminId: string
) {
  const { data, error } = await supabase
    .from('licencias')
    .update({ estado, revisado_por: adminId })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as Licencia
}
