import { supabase } from './supabase'
import type { Notificacion } from '../types'

export async function getNotificaciones() {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []) as Notificacion[]
}

export async function marcarLeida(id: string) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', id)

  if (error) throw error
}

export async function marcarTodasLeidas() {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('leida', false)

  if (error) throw error
}
