import { Database } from '@/lib/database.types'

export type Tables = Database['public']['Tables']
export type TablaVotos = Tables['votos']['Row']
export type TablaMiembros = Tables['miembros']['Row']
export type TablaPagos = Tables['pagos']['Row']
export type UpdateVoto = Tables['votos']['Update']
export type InsertPago = Tables['pagos']['Insert']
export type VotoUpdate = Tables['votos']['Update']

export type VotoBasico = Pick<TablaVotos, 'recaudado' | 'monto_total'>

export interface VotoConRelaciones extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos' | 'email'>
  pagos?: TablaPagos[]
}