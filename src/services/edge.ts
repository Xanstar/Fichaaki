import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

export async function invokeEdgeFunction(
  name: string,
  body: Record<string, unknown>
) {
  const { data, error } = await supabase.functions.invoke(name, { body })

  if (error) {
    let message = error.message

    if (error instanceof FunctionsHttpError) {
      try {
        const details = await error.context.json()
        message = details.error ?? message
      } catch {
        // sin mensaje extra; queda el mensaje del error original
      }
    }

    throw new Error(message)
  }

  return data
}
