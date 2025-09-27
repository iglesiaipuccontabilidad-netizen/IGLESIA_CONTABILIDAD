import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

type MiembroRolEstado = {
  rol: 'admin' | 'usuario' | 'pendiente'
  estado: 'activo' | 'inactivo'
}

export default async function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  if (adminOnly) {
    const response: PostgrestSingleResponse<MiembroRolEstado> = await supabase
      .from('miembros')
      .select('rol, estado')
      .eq('id', user.id)
      .single()

    const { data: member, error: memberError } = response

    if (memberError || !member || member.rol !== 'admin' || member.estado !== 'activo') {
      redirect('/dashboard')
    }
  } else {
    // Verificar que el usuario esté activo para cualquier ruta protegida
    const response: PostgrestSingleResponse<MiembroRolEstado> = await supabase
      .from('miembros')
      .select('estado, rol')
      .eq('id', user.id)
      .single()

    const { data: member, error: memberError } = response

    if (memberError || !member || member.estado !== 'activo' || member.rol === 'pendiente') {
      redirect('/login')
    }
  }

  return <>{children}</>
}