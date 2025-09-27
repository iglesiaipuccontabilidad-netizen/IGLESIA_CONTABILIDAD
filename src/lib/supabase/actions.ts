import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Database } from '../database.types'

export async function createActionClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // La configuración de cookies puede fallar en un Server Component
            // Esto se puede ignorar si tienes middleware actualizando las sesiones
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch {
            // La eliminación de cookies puede fallar en un Server Component
            // Esto se puede ignorar si tienes middleware actualizando las sesiones
          }
        },
      },
    }
  )
}