'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import { MiembroCombobox } from '@/components/miembros/MiembroCombobox'

import { SupabaseClient } from '@supabase/supabase-js'

type TablaVotos = Database['public']['Tables']['votos']['Insert']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']
interface MiembroData {
  estado: 'activo' | 'inactivo'
  rol: 'admin' | 'usuario' | 'pendiente'
}

export default function NuevoVotoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [miembros, setMiembros] = React.useState<TablaMiembros[]>([])
  const [formData, setFormData] = React.useState({
    proposito: '',
    montoTotal: '',
    fechaLimite: '',
    miembroId: '' as string | null
  })
  const [loading, setLoading] = React.useState(false)
  const [loadingMiembros, setLoadingMiembros] = React.useState(true)
  const [error, setError] = React.useState('')
  const [errorMiembros, setErrorMiembros] = React.useState('')

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingMiembros(true)
        setErrorMiembros('')

        // Verificar la sesión del usuario
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw new Error('Error al verificar la sesión')
        if (!session) throw new Error('No hay sesión activa')

        // Cargar lista de miembros
        const { data, error } = await supabase
          .from('miembros')
          .select('id, nombres, apellidos, cedula')
          .order('apellidos')

        if (error) {
          throw new Error('Error al cargar la lista de miembros')
        }

        setMiembros(data || [])
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        setErrorMiembros(error instanceof Error ? error.message : 'Error desconocido')
      } finally {
        setLoadingMiembros(false)
      }
    }

    fetchInitialData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verificar la sesión del usuario
      const sessionResult = await supabase.auth.getSession()
      console.log('Resultado de sesión:', sessionResult)
      
      const { data: { session }, error: sessionError } = sessionResult
      if (sessionError) {
        console.error('Error de sesión:', sessionError)
        throw new Error(`Error al verificar la sesión: ${sessionError.message}`)
      }
      if (!session) {
        console.error('No hay sesión activa')
        throw new Error('No hay sesión activa')
      }
      
      console.log('Sesión activa:', {
        userId: session.user.id,
        email: session.user.email
      })

      // Verificar que el usuario es un miembro activo
      console.log('Verificando miembro con ID:', session.user.id)
      
      const miembroResult = await supabase
        .from('miembros')
        .select('estado, rol')
        .eq('id', session.user.id)
        .single()
      
      console.log('Resultado de consulta de miembro:', miembroResult)
      
      const { data: miembroData, error: miembroError } = miembroResult as unknown as { 
        data: MiembroData | null, 
        error: any 
      }

      if (miembroError) {
        console.error('Error al verificar miembro:', miembroError)
        throw new Error('Error al verificar tu estado como miembro')
      }

      if (!miembroData) {
        throw new Error('No se encontró tu registro de miembro')
      }

      if (miembroData.estado !== 'activo') {
        throw new Error('Tu cuenta no está activa. Contacta al administrador.')
      }

      if (!['admin', 'usuario'].includes(miembroData.rol)) {
        throw new Error('No tienes el rol necesario para crear votos')
      }

      const nuevoVoto: TablaVotos = {
        proposito: formData.proposito,
        monto_total: parseFloat(formData.montoTotal),
        fecha_limite: formData.fechaLimite,
        miembro_id: formData.miembroId,
        estado: 'activo',
        recaudado: 0,
        creado_por: session.user.id,
        ultima_actualizacion_por: session.user.id
      } as TablaVotos

      console.log('Intentando crear voto:', nuevoVoto)
      
      const { data: votoCreado, error: insertError } = await supabase
        .from('votos')
        .insert([nuevoVoto] as any)
        .select()
        .single()

      if (insertError) {
        console.error('Error de Supabase:', insertError)
        if (insertError.code === '42501') {
          throw new Error('No tienes permiso para crear votos. Verifica que tu cuenta esté activa.')
        }
        if (insertError.code === 'PGRST116') {
          throw new Error('Error de permisos: No estás autorizado para crear votos')
        }
        throw new Error(`Error al crear el voto: ${insertError.message}`)
      }

      console.log('Voto creado exitosamente:', votoCreado)
      router.push('/dashboard/votos')
      router.refresh()
    } catch (error: any) {
      console.error('Error al crear voto:', error)
      setError(error.message || 'Error al crear el voto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <main className="container max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Voto</h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="proposito" className="block text-sm font-medium text-gray-700">
              Propósito del Voto <span className="text-red-500">*</span>
            </label>
            <textarea
              id="proposito"
              name="proposito"
              value={formData.proposito}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Describe el propósito del voto..."
            />
            <p className="text-sm text-gray-500">Describe claramente el propósito para el cual se realiza este voto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="montoTotal" className="block text-sm font-medium text-gray-700">
                Monto Total <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="montoTotal"
                name="montoTotal"
                value={formData.montoTotal}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="$0"
              />
              <p className="text-sm text-gray-500">Monto total del compromiso en COP</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="fechaLimite" className="block text-sm font-medium text-gray-700">
                Fecha Límite <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fechaLimite"
                name="fechaLimite"
                value={formData.fechaLimite}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">Fecha límite para completar el voto</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="miembroId" className="block text-sm font-medium text-gray-700">
              Miembro <span className="text-red-500">*</span>
            </label>
            {loadingMiembros ? (
              <div className="flex items-center justify-center h-10 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cargando miembros...</span>
                </div>
              </div>
            ) : errorMiembros ? (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {errorMiembros}
              </div>
            ) : (
              <MiembroCombobox
                miembros={miembros}
                value={formData.miembroId || ''}
                onChange={(id) => setFormData(prev => ({ ...prev, miembroId: id }))}
                placeholder="Buscar por nombre, apellido o cédula..."
                disabled={loading}
              />
            )}
            <p className="text-sm text-gray-500">Selecciona el miembro que realizará el voto</p>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Crear Voto'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}