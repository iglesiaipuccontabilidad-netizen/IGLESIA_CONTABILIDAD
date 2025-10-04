'use client'

import { login } from './actions'
import { useSearchParams, useRouter } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const mensaje = searchParams.get('mensaje')
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sistema de Votos IPUC
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión para acceder al sistema
          </p>
        </div>

        <ErrorBoundary
          fallback={
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                Ha ocurrido un error al iniciar sesión
              </div>
            </div>
          }
        >
          <form className="mt-8 space-y-6">
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="sr-only">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Correo electrónico"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            {mensaje && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{mensaje}</div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                formAction={login}
                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => router.push('/registro')}
                className="group relative flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Registrarse
              </button>
            </div>
          </form>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
            <div className="text-center">Cargando...</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
            