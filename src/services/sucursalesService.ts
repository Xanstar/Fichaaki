import { supabase } from './supabase'
import type { Sucursal } from '../types'

export async function getSucursales() {
  const { data, error } = await supabase
    .from('sucursales')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error

  return (data ?? []) as Sucursal[]
}

export async function createSucursal(input: {
  nombre: string
  direccion: string
  codigo: string
  lat: number | null
  lng: number | null
  radio_m: number
}) {
  const { data, error } = await supabase
    .from('sucursales')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  return data as Sucursal
}

export async function updateSucursal(
  id: string,
  input: {
    nombre: string
    direccion: string
    codigo: string
    lat: number | null
    lng: number | null
    radio_m: number
  }
) {
  const { data, error } = await supabase
    .from('sucursales')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data as Sucursal
}

export async function deleteSucursal(id: string) {
  const { error } = await supabase.from('sucursales').delete().eq('id', id)

  if (error) throw error
}
