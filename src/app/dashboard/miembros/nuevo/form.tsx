'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createMember } from '@/app/api/miembros/actions'

export default function NuevoMiembroForm() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      console.log('1. Iniciando envío del formulario')
      e.preventDefault()
      setLoading(true)
      setError('')

      const formData = new FormData(e.currentTarget)

      await createMember(formData)

      console.log('6. Éxito - redirigiendo...')
      router.push('/dashboard/miembros')
      router.refresh()
    } catch (err: any) {
      console.error('Error:', err)
      setError('Error al guardar: ' + (err.message || 'No se pudo crear el miembro'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Nuevo Miembro
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registrar un nuevo miembro en el sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">👤</span>
              Información Personal
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nombres" className="block text-sm font-medium text-gray-700">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  pattern="[0-9]{8,12}"
                  title="Ingrese un número de cédula válido (8-12 dígitos)"
                  required
                />
                <p className="text-sm text-gray-500">
                  Ingrese solo números, sin puntos ni espacios
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">📞</span>
              Información de Contacto
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="(opcional)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="(opcional)"
                />
              </div>
            </div>
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
                'Crear Miembro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}