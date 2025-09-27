import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import PagoForm from '@/components/pagos/PagoForm'
import HistorialPagos from '@/components/pagos/HistorialPagos'
import styles from '@/styles/pagos.module.css'
import { Database } from '@/lib/database.types'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

interface VotoConMiembro extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos'>
}

export default async function PagosVotoPage({ params }: { params: { votoId: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Obtener detalles del voto
  const { data: voto, error } = await supabase
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
        apellidos
      )
    `)
    .eq('id', params.votoId)
    .single()

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
        <h1>Gestión de Pagos - Voto</h1>
        <div className={styles.votoInfo}>
          <h2>{voto.proposito}</h2>
          <p>Miembro: {voto.miembro[0]?.nombres} {voto.miembro[0]?.apellidos}</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <label>Monto Total</label>
          <span>{formatearMonto(voto.monto_total)}</span>
        </div>
        <div className={styles.stat}>
          <label>Recaudado</label>
          <span>{formatearMonto(voto.recaudado || 0)}</span>
        </div>
        <div className={styles.stat}>
          <label>Pendiente</label>
          <span>{formatearMonto(montoPendiente)}</span>
        </div>
        <div className={styles.stat}>
          <label>Progreso</label>
          <span>{progreso}%</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.pagoFormContainer}>
          <h3>Registrar Nuevo Pago</h3>
          <PagoForm
            votoId={voto.id}
            montoTotal={voto.monto_total}
            recaudado={voto.recaudado || 0}
          />
        </div>

        <div className={styles.historialContainer}>
          <HistorialPagos votoId={voto.id} />
        </div>
      </div>
    </div>
  )
}
