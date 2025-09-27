'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMember(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const nombres = formData.get('nombres')?.toString()?.trim()
  const apellidos = formData.get('apellidos')?.toString()?.trim()
  const cedula = formData.get('cedula')?.toString()?.trim()
  const email = formData.get('email')?.toString()?.trim()
  const password = formData.get('password')?.toString()
  const passwordConfirmation = formData.get('password_confirmation')?.toString()
  const telefono = formData.get('telefono')?.toString()?.trim()
  const fechaNacimiento = formData.get('fecha_nacimiento')?.toString()
  const genero = formData.get('genero')?.toString()
  const direccion = formData.get('direccion')?.toString()?.trim()

  if (!nombres || !apellidos || !cedula || !email || !password || !telefono || !fechaNacimiento || !genero) {
    throw new Error('Todos los campos obligatorios son requeridos')
  }

  if (password !== passwordConfirmation) {
    throw new Error('Las contraseñas no coinciden')
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  // Verificar si ya existe un miembro con ese correo o cédula
  const { data: existingMember, error: checkError } = await supabase
    .from('miembros')
    .select('id')
    .or(`email.eq.${email},cedula.eq.${cedula}`)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error('Error al verificar miembro existente')
  }

  if (existingMember) {
    throw new Error('Ya existe un miembro con ese correo o cédula')
  }

  // Crear el usuario en Auth
  const { data: auth, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    throw new Error('Error al crear la cuenta de usuario')
  }

  // Insertar en tabla miembros usando la función RPC
  const { error: memberError } = await supabase.rpc('registrar_miembro', {
    p_id: auth.user.id,
    p_nombres: nombres,
    p_apellidos: apellidos,
    p_cedula: cedula,
    p_email: email,
    p_telefono: telefono,
    p_fecha_nacimiento: fechaNacimiento,
    p_genero: genero,
    p_direccion: direccion || null,
    p_rol: email.includes('admin') ? 'admin' : 'pendiente',
    p_estado: 'activo'
  })

  if (memberError) {
    // Si hubo error, eliminar el usuario de Auth
    await supabase.auth.admin.deleteUser(auth.user.id)
    throw new Error('Error al crear el perfil del miembro')
  }

  // Todo salió bien
  revalidatePath('/miembros')
  redirect('/miembros?mensaje=Miembro registrado exitosamente')
}