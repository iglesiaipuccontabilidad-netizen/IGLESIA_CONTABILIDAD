import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  
  // Crea una respuesta por defecto
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  try {
    // Actualiza la sesión de auth si existe
    const { data: { session } } = await supabase.auth.getSession()

    // Lista de rutas públicas
    const publicRoutes = ['/login', '/registro', '/auth', '/error']
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Redirección a login si no hay sesión y no es ruta pública
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirección a dashboard si hay sesión y está en rutas de auth
    if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    return response
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/registro',
    '/auth/:path*',
  ],
}