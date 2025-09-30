import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Database } from '../database.types'
import { getCookieValue } from './cookies'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type InsertVotos = Database['public']['Tables']['votos']['Insert']
type UpdateVotos = Database['public']['Tables']['votos']['Update']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']
type TablaPagos = Database['public']['Tables']['pagos']['Row']
type InsertPagos = Database['public']['Tables']['pagos']['Insert']
type UpdatePagos = Database['public']['Tables']['pagos']['Update']

interface VotoConRelaciones extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos' | 'email' | 'cedula'>
  pagos?: TablaPagos[]
}

import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export async function createActionClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return getCookieValue(cookie, name)
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

export async function getVotoById(votoId: string): Promise<VotoConRelaciones> {
  const supabase = await createActionClient()
  
  const { data: voto, error } = await supabase
    .from('votos')
    .select(`
      *,
      miembro:miembros (
        id,
        nombres,
        apellidos,
        email,
        cedula
      ),
      pagos:pagos (
        id,
        monto,
        fecha_pago,
        nota,
        registrado_por
      )
    `)
    .eq('id', votoId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return voto as VotoConRelaciones
}

interface RegistrarPagoParams {
  votoId: string
  monto: number
  nota?: string
  registradoPor: string
}

export async function registrarPago({ votoId, monto, nota, registradoPor }: RegistrarPagoParams) {
  const supabase = await createActionClient()

  // Iniciar una transacción para actualizar el voto y registrar el pago
  const { data: voto, error: votoError } = await supabase
    .from('votos')
    .select('*')
    .eq('id', votoId)
    .single()

  if (votoError) {
    throw new Error(votoError.message)
  }

  const votoData = voto as TablaVotos

  const nuevoRecaudado = (votoData.recaudado || 0) + monto
  if (nuevoRecaudado > votoData.monto_total) {
    throw new Error('El monto del pago excede el valor pendiente del voto')
  }

  // Preparar datos del pago según el tipo InsertPagos
  const nuevoPago: InsertPagos = {
    voto_id: votoId,
    monto,
    nota: nota || null,
    fecha_pago: new Date().toISOString(),
    registrado_por: registradoPor
  } // Note: metodoPago no se usa porque no existe en la tabla

  // Registrar el pago
  const { error: pagoError } = await supabase
    .from('pagos')
    .insert(nuevoPago as any) // TODO: Remover el cast a any cuando se arregle el tipo

  if (pagoError) {
    throw new Error(pagoError.message)
  }

  // Preparar actualización del voto según el tipo UpdateVotos
  const actualizacionVoto: UpdateVotos = {
    recaudado: nuevoRecaudado
  }

  // Actualizar el monto recaudado en el voto
  const { error: updateError } = await supabase
    .from('votos')
    .update(actualizacionVoto as never)
    .eq('id', votoId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return { success: true }
}