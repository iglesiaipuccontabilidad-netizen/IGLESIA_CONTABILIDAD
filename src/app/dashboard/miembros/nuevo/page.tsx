export default function NuevoMiembroPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nuevo Miembro
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registrar un nuevo miembro en el sistema
          </p>
        </div>

        <div className="mt-8">
          <form action="/api/miembros" method="POST" className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">👤</span>
                Información Personal
              </h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    minLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    minLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cédula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    pattern="[0-9]{8,12}"
                    title="Ingrese un número de cédula válido (8-12 dígitos)"
                  />
                  <small className="text-gray-500 text-xs">
                    Ingrese solo números, sin puntos ni espacios
                  </small>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Género <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="genero" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">📞</span>
                Información de Contacto
              </h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    pattern="[0-9]{10}"
                    title="Ingrese un número de teléfono válido (10 dígitos)"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">🔒</span>
                Configuración de Cuenta
              </h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    minLength={6}
                  />
                  <small className="text-gray-500 text-xs">
                    Mínimo 6 caracteres
                  </small>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Registrar Miembro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  // Duplicate/old code below is removed because layoutStyles is not defined and the above form already exists.
}