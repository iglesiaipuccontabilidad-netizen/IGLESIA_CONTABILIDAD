export function decodeSupabaseCookie(value: string): string {
  // Detecta si es una cookie de Supabase en base64
  if (value.startsWith('base64-')) {
    try {
      const base64Value = value.replace('base64-', '')
      return Buffer.from(base64Value, 'base64').toString('utf-8')
    } catch (error) {
      console.warn('Error decodificando cookie base64:', error)
      return value
    }
  }
  
  // Si no es base64, intentar decodificar URI
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function isSupabaseAuthCookie(name: string): boolean {
  return name === 'sb-access-token' || 
         name === 'sb-refresh-token' || 
         name.startsWith('sb-')
}

export function getCookieValue(cookie: { value: string } | undefined, name: string): string | undefined {
  if (!cookie) return undefined
  
  if (isSupabaseAuthCookie(name)) {
    return cookie.value // No decodificar cookies de autenticación
  }
  
  return decodeSupabaseCookie(cookie.value)
}