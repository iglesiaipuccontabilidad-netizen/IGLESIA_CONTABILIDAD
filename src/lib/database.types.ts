export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      miembros: {
        Row: {
          id: string
          nombres: string
          apellidos: string
          cedula: string
          fecha_nacimiento: string | null
          genero: 'M' | 'F' | null
          telefono: string | null
          email: string | null
          direccion: string | null
          rol: 'admin' | 'usuario' | 'pendiente'
          estado: 'activo' | 'inactivo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombres: string
          apellidos: string
          cedula: string
          fecha_nacimiento?: string | null
          genero?: 'M' | 'F' | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          rol?: 'admin' | 'usuario' | 'pendiente'
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombres?: string
          apellidos?: string
          cedula?: string
          fecha_nacimiento?: string | null
          genero?: 'M' | 'F' | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          rol?: 'admin' | 'usuario' | 'pendiente'
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
      }
      votos: {
        Row: {
          id: string
          miembro_id: string
          proposito: string
          monto_total: number
          recaudado: number
          fecha_limite: string
          estado: 'activo' | 'completado' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          miembro_id: string
          proposito: string
          monto_total: number
          recaudado?: number
          fecha_limite: string
          estado?: 'activo' | 'completado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          miembro_id?: string
          proposito?: string
          monto_total?: number
          recaudado?: number
          fecha_limite?: string
          estado?: 'activo' | 'completado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
      }
      pagos: {
        Row: {
          id: string
          voto_id: string
          monto: number
          fecha_pago: string
          nota: string | null
          registrado_por: string
          created_at: string
        }
        Insert: {
          id?: string
          voto_id: string
          monto: number
          fecha_pago?: string
          nota?: string | null
          registrado_por: string
          created_at?: string
        }
        Update: {
          id?: string
          voto_id?: string
          monto?: number
          fecha_pago?: string
          nota?: string | null
          registrado_por?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}