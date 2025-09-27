import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '../database.types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)
          if (!cookie) return undefined
          return decodeURIComponent(cookie.value)
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.delete({
            name,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANTE: NO ELIMINAR auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicRoutes = ['/login', '/registro', '/auth', '/error']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si no hay usuario y no estamos en ruta pública, redirigir a login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay usuario y no estamos en ruta pública
  if (user && !isPublicRoute) {
    type MiembroInfo = Pick<Database['public']['Tables']['miembros']['Row'], 'rol' | 'estado'>
    const { data: member, error: memberError } = await supabase
      .from('miembros')
      .select('rol, estado')
      .eq('id', user.id)
      .single()

    const memberData = member as MiembroInfo | null

    // Si hay error o el usuario no existe, cerrar sesión
    if (memberError || !memberData) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Si el usuario está inactivo o pendiente, redirigir a login
    if (memberData.estado !== 'activo' || memberData.rol === 'pendiente') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Si intenta acceder a rutas admin sin ser admin
    if (request.nextUrl.pathname.startsWith('/admin') && memberData.rol !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}