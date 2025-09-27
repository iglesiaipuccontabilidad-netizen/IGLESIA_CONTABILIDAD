'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { aprobarUsuario, rechazarUsuario } from '@/app/login/actions'
import { Database } from '@/lib/database.types'
import { ErrorBoundary } from 'react-error-boundary'
import { redirect } from 'next/navigation'
import { IconUserCircle, IconRefresh, IconUserCheck, IconUserX } from "@tabler/icons-react"

type Miembro = Database['public']['Tables']['miembros']['Row']

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Miembro[]>([])
  const { user, member } = useAuth()
  const supabase = createClient()

  // Redirigir si no es admin
  if (!member || member.rol !== 'admin') {
    redirect('/dashboard')
  }

  useEffect(() => {
    const cargarUsuarios = async () => {
      const { data: usuarios, error } = await supabase
        .from('miembros')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar usuarios:', error)
        return
      }

      setUsuarios(usuarios)
    }

    cargarUsuarios()
  }, [supabase])

  const getEstadoBadgeVariant = (rol: string, estado: string) => {
    if (estado === 'inactivo') return 'destructive'
    if (rol === 'pendiente') return 'warning'
    if (rol === 'admin') return 'premium'
    return 'success'
  }

  const getEstadoIcon = (rol: string, estado: string) => {
    if (estado === 'inactivo') return <IconUserX className="w-4 h-4" />
    if (rol === 'pendiente') return <IconUserCircle className="w-4 h-4" />
    if (rol === 'admin') return <IconUserCheck className="w-4 h-4 text-purple-500" />
    return <IconUserCheck className="w-4 h-4 text-green-500" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative mb-8 bg-white rounded-xl shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-500/5 rounded-xl"></div>
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              Administra los usuarios del sistema y sus permisos
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-100">
            <div className="text-sm font-medium text-blue-900">
              Total: <span className="text-blue-600">{usuarios.length}</span> usuarios
            </div>
          </div>
        </div>
      </div>

      <ErrorBoundary
        fallback={
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 animate-pulse">
            <div className="text-sm text-red-700 flex items-center gap-2">
              <IconRefresh className="w-5 h-5 animate-spin" />
              Ha ocurrido un error al cargar los usuarios
            </div>
          </div>
        }
      >
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h2>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activos: {usuarios.filter(u => u.estado !== 'inactivo').length}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pendientes: {usuarios.filter(u => u.rol === 'pendiente').length}
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-white">
                <th className="px-6 py-4 text-left">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</div>
                  <div className="text-xs text-gray-400 mt-0.5">Información del usuario</div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cédula</div>
                  <div className="text-xs text-gray-400 mt-0.5">Documento de identidad</div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</div>
                  <div className="text-xs text-gray-400 mt-0.5">Correo electrónico</div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</div>
                  <div className="text-xs text-gray-400 mt-0.5">Rol y actividad</div>
                </th>
                <th className="px-6 py-4 text-right">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</div>
                  <div className="text-xs text-gray-400 mt-0.5">Gestionar usuario</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getEstadoIcon(usuario.rol, usuario.estado)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {usuario.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.cedula}</div>
                    <div className="text-xs text-gray-500">Documento</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                    <div className="text-xs text-gray-500">Contacto</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.estado === 'inactivo'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : usuario.rol === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : usuario.rol === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        usuario.estado === 'inactivo'
                          ? 'bg-red-400'
                          : usuario.rol === 'admin'
                          ? 'bg-purple-400'
                          : usuario.rol === 'pendiente'
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}></span>
                      {usuario.estado === 'inactivo'
                        ? 'Inactivo'
                        : usuario.rol === 'admin'
                        ? 'Administrador'
                        : usuario.rol === 'pendiente'
                        ? 'Pendiente'
                        : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {usuario.rol === 'pendiente' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => aprobarUsuario(usuario.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors duration-150"
                        >
                          <IconUserCheck className="w-4 h-4 mr-1.5" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => rechazarUsuario(usuario.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors duration-150"
                        >
                          <IconUserX className="w-4 h-4 mr-1.5" />
                          Rechazar
                        </button>
                      </div>
                    )}
                    {usuario.estado === 'inactivo' && (
                      <button
                        onClick={() => aprobarUsuario(usuario.id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors duration-150"
                      >
                        <IconRefresh className="w-4 h-4 mr-1.5" />
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  )
}
