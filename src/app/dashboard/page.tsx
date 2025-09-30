import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import DashboardCards from '@/components/dashboard/DashboardCards'
import VotosActivosTable from '@/components/dashboard/VotosActivosTable'
import styles from '@/styles/dashboard.module.css'
import { Database } from '@/lib/database.types'
import { Voto } from '@/types/dashboard'

// Tipos base de Supabase
type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

// Interfaces para los datos del dashboard
interface DashboardStats {
  total_comprometido: number
  total_recaudado: number
  total_pendiente: number
  votos_activos: number
}

async function getDashboardStats() {
  const supabase = await createClient()
  
  // Obtener los totales de todos los votos
  const { data: votosData, error: votosError } = await supabase
    .from('votos')
    .select('monto_total, recaudado')
    .eq('estado', 'activo')
    .returns<Array<{ monto_total: number; recaudado: number }>>()

  if (votosError) {
    console.error('Error al obtener votos:', votosError)
    throw new Error('No se pudieron obtener las estadísticas del dashboard')
  }

  // Calcular las estadísticas
  const stats: DashboardStats = {
    total_comprometido: votosData.reduce((sum, voto) => sum + (voto.monto_total || 0), 0),
    total_recaudado: votosData.reduce((sum, voto) => sum + (voto.recaudado || 0), 0),
    total_pendiente: 0, // Se calcula abajo
    votos_activos: votosData.length
  }

  // Calcular el total pendiente
  stats.total_pendiente = stats.total_comprometido - stats.total_recaudado

  return stats
}

async function getVotosActivos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('votos')
    .select(`
      id,
      proposito,
      monto_total,
      recaudado,
      fecha_limite,
      estado,
      miembro:miembros (
        id,
        nombres,
        apellidos,
        cedula
      )
    `)
    .eq('estado', 'activo')
    .order('fecha_limite', { ascending: true })

  if (error) throw new Error('Error al obtener votos activos')
  return data
}

type DeudorConVotos = TablaMiembros & {
  votos: Array<Pick<TablaVotos, 'monto_total' | 'recaudado' | 'fecha_limite' | 'estado'>>
}

type DeudorProcesado = DeudorConVotos & {
  deudaTotal: number
}



export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const votosRaw = await getVotosActivos()

  // Los datos de votosRaw, deudoresRaw y alertasRaw ya se obtienen con Promise.all arriba.
  // Si necesitas manejar errores, puedes agregar validaciones aquí según lo que retornen las funciones getVotosActivos, getTopDeudores y getAlertasVencimiento.
  if (!votosRaw) {
    console.error('Error al obtener votos')
    return null
  }

  // Transformar los datos para los componentes
  const votosFormateados = (votosRaw || []).map((voto: TablaVotos & {
    miembro: TablaMiembros
  }): Voto => ({
    id: voto.id,
    proposito: voto.proposito,
    monto: voto.monto_total,
    recaudado: voto.recaudado || 0,
    fecha_limite: voto.fecha_limite,
    miembro: {
      nombres: voto.miembro.nombres,
      apellidos: voto.miembro.apellidos
    }
  }))



  return (
    <div className={styles.mainContainer}>
      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <DashboardCards
          totalComprometido={stats.total_comprometido}
          totalRecaudado={stats.total_recaudado}
          totalPendiente={stats.total_pendiente}
          votosActivos={stats.votos_activos}
        />
      </Suspense>
      
      <div className={styles.dashboardContent}>
        <Suspense fallback={<div>Cargando votos activos...</div>}>
          <VotosActivosTable votos={votosFormateados} />
        </Suspense>
      </div>
    </div>
  )
}