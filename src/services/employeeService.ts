import { supabase } from './supabase'
import { invokeEdgeFunction } from './edge'

export async function getEmployees() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('rol', 'employee')
    .order('nombre', { ascending: true })

  if (error) throw error

  return data ?? []
}

export async function createEmployee(data: {
  nombre: string
  apellido: string
  email: string
  password: string
  cargo: string
  rubro: string
  jornada_inicio: string
  jornada_fin: string
}) {
  return invokeEdgeFunction('create-employee', data)
}

export async function updateEmployee(data: {
  id: string
  nombre: string
  apellido: string
  email: string
  password?: string
  cargo: string
  rubro: string
  jornada_inicio: string
  jornada_fin: string
}) {
  return invokeEdgeFunction('update-employee', data)
}
