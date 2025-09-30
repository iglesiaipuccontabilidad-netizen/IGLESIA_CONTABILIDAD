import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
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

  // IMPORTANTE: No remover getClaims()
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // No hay usuario, redirigir al login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: Debes retornar el objeto supabaseResponse tal como está. Si estás
  // creando una nueva respuesta con NextResponse.next() asegúrate de:
  // 1. Pasar el request en ella, como:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copiar las cookies:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Modificar myNewResponse según necesites, pero evita cambiar
  //    las cookies!
  // 4. Finalmente:
  //    return myNewResponse
  // Si no haces esto, puedes causar que el navegador y servidor pierdan
  // sincronización y terminen la sesión del usuario prematuramente!

  return supabaseResponse
}