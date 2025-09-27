export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">Lo sentimos, ha ocurrido un error.</p>
        <p className="mt-4 text-sm text-gray-500">
          Por favor intenta de nuevo o contacta al administrador si el problema persiste.
        </p>
      </div>
    </div>
  )
}