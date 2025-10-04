import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ 
            name, 
            value, 
            ...options 
          })
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({ 
            name,
            ...options
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Lista de rutas públicas
  const publicRoutes = ['/login', '/registro', '/auth', '/error']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si no hay sesión y no es una ruta pública
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión y es una ruta de autenticación
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión y es una ruta de admin
  if (session && request.nextUrl.pathname.startsWith('/admin')) {
    // En el Edge Runtime no podemos hacer consultas a la base de datos
    // La verificación del rol de admin se hará en la página de admin
    const adminCookie = request.cookies.get('admin')
    if (!adminCookie) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/(dashboard|admin)/:path*',
    '/login',
    '/registro',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}