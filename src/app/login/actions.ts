'use server'

import { createActionClient } from '@/lib/supabase/actions'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { AUTH_ERRORS, parseAuthError } from '@/lib/auth/errors'
import { Database } from '@/lib/database.types'

export async function login(formData: FormData) {
  try {
    const email = formData.get('email')?.toString()?.trim()
    const password = formData.get('password')?.toString()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(AUTH_ERRORS.InvalidEmail)
    }

    if (!password || password.length < 6) {
      throw new Error(AUTH_ERRORS.WeakPassword)
    }

    const supabase = await createActionClient()

    console.log('Iniciando login con:', { email })

    // Primero intentamos enviar un enlace mágico para confirmar el email si es necesario
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false // No crear usuario si no existe
      }
    })

    // Si no hay error con el magic link, significa que el usuario existe
    // Si hay error, intentamos el login normal de todos modos
    if (magicLinkError && !magicLinkError.message.includes('Email not confirmed')) {
      console.log('Usuario no encontrado o error:', magicLinkError)
    } else {
      console.log('Se envió un enlace de confirmación si era necesario')
    }
    
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('Resultado de autenticación:', result)

    if (result.error) {
      console.error('Error de autenticación:', result.error)
      throw new Error(parseAuthError(result.error))
    }

    const user = result.data.user
    if (!user) {
      throw new Error(AUTH_ERRORS.UserNotFound)
    }

    // Verificar el estado del usuario en la tabla miembros
    type MiembroStatus = {
      estado: 'activo' | 'inactivo'
      rol: 'admin' | 'usuario' | 'pendiente'
    }

    const { data: miembro, error: miembroError } = await supabase
      .from('miembros')
      .select('estado, rol')
      .eq('id', user.id)
      .single() as { data: MiembroStatus | null, error: any }

    if (miembroError) {
      console.error('Error al verificar estado del miembro:', miembroError)
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    if (!miembro) {
      console.error('No se encontró el perfil del miembro')
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.ProfileNotFound)
    }

    if (miembro.estado === 'inactivo') {
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.AccountInactive)
    }

    if (miembro.rol === 'pendiente') {
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.PendingApproval)
    }

    // Todo está bien, redirigir al dashboard
    revalidatePath('/')
    return redirect('/dashboard')
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error(AUTH_ERRORS.NetworkError)
      }
    }

export async function signup(formData: FormData) {
  const supabase = await createActionClient()
  let user = null

  try {
    const nombres = formData.get('nombres')?.toString()?.trim()
    const apellidos = formData.get('apellidos')?.toString()?.trim()
    const cedula = formData.get('cedula')?.toString()?.trim()
    const email = formData.get('email')?.toString()?.trim()
    const password = formData.get('password')?.toString()
    const telefono = formData.get('telefono')?.toString()?.trim()

    if (!nombres || !apellidos || !cedula || !email || !password || !telefono) {
      throw new Error(AUTH_ERRORS.InvalidData)
    }

    // Para desarrollo, usamos admin.createUser para evitar confirmación de email
    const { data: { user: createdUser }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombres,
        apellidos,
        cedula,
        telefono
      }
    })

    if (signUpError) {
      console.error('Error de registro:', signUpError)
      throw new Error(parseAuthError(signUpError))
    }

    if (!createdUser) {
      throw new Error(AUTH_ERRORS.SignupError)
    }

    user = createdUser

    // Verificar si el miembro ya existe
    const { data: existingMembers, error: checkError } = await supabase
      .from('miembros')
      .select('id')
      .eq('id', user.id)
      
    if (checkError) {
      console.error('Error al verificar miembro existente:', checkError)
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    if (existingMembers && existingMembers.length > 0) {
      console.log('El miembro ya existe:', existingMembers[0])
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DuplicateEmail)
    }

    // Verificar si ya existe un miembro con ese correo
    const { data: emailCheck, error: emailCheckError } = await supabase
      .from('miembros')
      .select('id')
      .eq('email', email)

    if (emailCheckError) {
      console.error('Error al verificar correo existente:', emailCheckError)
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    if (emailCheck && emailCheck.length > 0) {
      console.log('El correo ya está registrado')
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DuplicateEmail)
    }

    // Verificar si ya existe un miembro con esa cédula
    const { data: cedulaCheck, error: cedulaCheckError } = await supabase
      .from('miembros')
      .select('id')
      .eq('cedula', cedula)

    if (cedulaCheckError) {
      console.error('Error al verificar cédula existente:', cedulaCheckError)
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    if (cedulaCheck && cedulaCheck.length > 0) {
      console.log('La cédula ya está registrada')
      await supabase.auth.signOut()
      throw new Error(AUTH_ERRORS.DuplicateEmail)
    }

    // Insertar en tabla miembros usando función de base de datos
    const { data: miembroData, error: miembroError } = await (supabase as any)
      .rpc('registrar_miembro', {
        p_id: user.id,
        p_nombres: nombres,
        p_apellidos: apellidos,
        p_cedula: cedula,
        p_email: email,
        p_telefono: telefono,
        p_rol: email.includes('admin') ? 'admin' : 'pendiente',
        p_estado: 'activo'
      })

    if (miembroError) {
      console.error('Error al crear miembro:', miembroError)
      await supabase.auth.signOut()
      // Si el error es de llave duplicada, significa que el perfil ya existe
      if (miembroError.message.includes('duplicate key')) {
        throw new Error(AUTH_ERRORS.DuplicateEmail)
      }
      throw new Error(AUTH_ERRORS.ProfileCreationError)
    }
    
    console.log('Miembro creado exitosamente:', miembroData)

    return redirect('/login?mensaje=Cuenta creada exitosamente. Ya puedes iniciar sesión.')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(AUTH_ERRORS.NetworkError)
  }
}

export async function logout() {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/login')
}

export async function aprobarUsuario(userId: string) {
  try {
    const supabase = await createActionClient()

    // Verificar si el usuario actual es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error(AUTH_ERRORS.UserNotFound)

    const { data: adminCheck, error: adminError } = await (supabase as any)
      .from('miembros')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (adminError) {
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    if (!adminCheck || adminCheck.rol !== 'admin') {
      throw new Error(AUTH_ERRORS.AdminRequired)
    }

    // Actualizar el rol del usuario
    const { error: updateError } = await (supabase as any)
      .from('miembros')
      .update({ rol: 'usuario' })
      .eq('id', userId)

    if (updateError) {
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    revalidatePath('/admin/usuarios')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(AUTH_ERRORS.NetworkError)
  }
}

export async function rechazarUsuario(userId: string) {
  try {
    const supabase = await createActionClient()

    // Verificar si el usuario actual es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error(AUTH_ERRORS.UserNotFound)

    const { data: adminCheck, error: adminError } = await (supabase as any)
      .from('miembros')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (adminError) {
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    if (!adminCheck || adminCheck.rol !== 'admin') {
      throw new Error(AUTH_ERRORS.AdminRequired)
    }

    // Actualizar el estado del usuario
    const { error: updateError } = await (supabase as any)
      .from('miembros')
      .update({ estado: 'inactivo' })
      .eq('id', userId)

    if (updateError) {
      throw new Error(AUTH_ERRORS.DatabaseError)
    }

    revalidatePath('/admin/usuarios')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(AUTH_ERRORS.NetworkError)
  }
}
  