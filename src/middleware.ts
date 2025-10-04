import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = ['/login', '/registro', '/auth', '/error']
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Verificar el token de sesión en las cookies
    const hasSessionToken = request.cookies.has('sb-access-token') ||
                          request.cookies.has('sb-refresh-token')

    // Redirección a login si no hay token de sesión y no es ruta pública
    if (!hasSessionToken && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirección a dashboard si hay token de sesión y está en rutas de auth
    if (hasSessionToken && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si todo está bien, continuar con la solicitud
    return NextResponse.next()
  } catch (error) {
    console.error('Error in middleware:', error)
    return NextResponse.next()
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