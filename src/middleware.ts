import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: No escribir lógica entre createServerClient y
  // supabase.auth.getClaims(). Un error simple podría hacer muy difícil debuggear
  // problemas con usuarios siendo desconectados aleatoriamente.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  try {
    // Si el usuario intenta acceder a una ruta protegida sin estar autenticado
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('returnTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Si el usuario está autenticado e intenta acceder a páginas de auth
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // IMPORTANTE: Debes retornar el objeto supabaseResponse tal como está.
    return supabaseResponse
  } catch (error) {
    console.error('Error en middleware:', error)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    '/(dashboard)/:path*',
    '/login',
    '/register',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}