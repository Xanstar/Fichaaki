import { supabase } from './supabase'
import type { Turno } from '../types'

export async function getTurnos() {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .order('jornada_inicio', { ascending: true })

  if (error) throw error

  return (data ?? []) as Turno[]
}

export async function createTurno(input: {
  nombre: string
  jornada_inicio: string
  jornada_fin: string
}) {
  const { data, error } = await supabase
    .from('turnos')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  return data as Turno
}

export async function updateTurno(
  id: string,
  input: {
    nombre: string
    jornada_inicio: string
    jornada_fin: string
  }
) {
  const { data, error } = await supabase
    .from('turnos')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as Turno
}

export async function deleteTurno(id: string) {
  const { error } = await supabase.from('turnos').delete().eq('id', id)

  if (error) throw error
}
