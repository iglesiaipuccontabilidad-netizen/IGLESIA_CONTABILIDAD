import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PagoForm from '@/components/pagos/PagoForm'
import HistorialPagos from '@/components/pagos/HistorialPagos'
import styles from '@/styles/components/PagosVoto.module.css'
import { Database } from '@/lib/database.types'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

export default async function PagosVotoPage({ params }: { params: { votoId: string } }) {
  const supabase = createClient()

  // Obtener detalles del voto
  const { data: votoQuery, error } = await supabase
    .from('votos')
    .select(`
      *,
      miembro:miembros(*)
    `)
    .eq('id', params.votoId)
    .single()

  if (error || !votoQuery) {
    notFound()
  }

  const voto = votoQuery as TablaVotos & { miembro: TablaMiembros }

  if (error || !voto) {
    notFound()
  }

  const montoPendiente = voto.monto_total - (voto.recaudado || 0)
  const progreso = Math.round((voto.recaudado || 0) * 100 / voto.monto_total)

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          Gestión de Pagos - Voto
        </h1>
        <div className={styles.votoInfo}>
          <h2>{voto.proposito}</h2>
          <p>Miembro: {voto.miembro?.nombres} {voto.miembro?.apellidos}</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <label>Monto Total</label>
          <span>{formatearMonto(voto.monto_total)}</span>
        </div>
        <div className={styles.stat}>
          <label>Recaudado</label>
          <span className="text-emerald-600">{formatearMonto(voto.recaudado || 0)}</span>
        </div>
        <div className={styles.stat}>
          <label>Pendiente</label>
          <span className="text-blue-600">{formatearMonto(montoPendiente)}</span>
        </div>
        <div className={styles.stat}>
          <label>Progreso</label>
          <div className="flex items-center gap-2">
            <span>{progreso}%</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.pagoFormContainer}>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Registrar Nuevo Pago
          </h3>
          <PagoForm
            votoId={voto.id}
            montoTotal={voto.monto_total}
            recaudado={voto.recaudado || 0}
          />
        </div>

        <div className={styles.historialContainer}>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Historial de Pagos
          </h3>
          <HistorialPagos votoId={voto.id} />
        </div>
      </div>
    </div>
  )
}
