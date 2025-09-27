import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Si el usuario intenta acceder a una ruta protegida sin estar autenticado
  if (!session && request.nextUrl.pathname.startsWith('/(dashboard)')) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado e intenta acceder a páginas de auth
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: ['/(dashboard)/:path*', '/login', '/register']
}