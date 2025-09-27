import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/database.types'
import styles from '@/styles/votos.module.css'
import Link from 'next/link'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

interface VotoConMiembro extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos' | 'cedula'>
}

export default async function VotoDetallePage({ params }: { params: { votoId: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

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
        apellidos,
        cedula
      )
    `)
    .eq('id', params.votoId)
    .single()

  if (error || !voto) {
    notFound()
  }

  // Supabase returns related rows as arrays when selecting nested relations.
  // Normalize miembro to a single object for easier consumption.
  const miembro = Array.isArray((voto as any).miembro) ? (voto as any).miembro[0] : (voto as any).miembro;

  const montoPendiente = voto.monto_total - (voto.recaudado || 0)
  const progreso = Math.round(((voto.recaudado || 0) / voto.monto_total) * 100)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={styles.votoDetalleContainer}>
      <div className={styles.votoDetalleHeader}>
        <h1 className={styles.votoDetalleTitle}>Detalles del Voto</h1>
        <Link href={`/pagos/${voto.id}`} className={styles.btnPrimary}>
          Registrar Pago
        </Link>
      </div>

      <div className={styles.votoDetalleGrid}>
        <div className={styles.votoDetalleCard}>
          <h2 className={styles.cardTitle}>Informaci�n del Voto</h2>
          <p><strong>Prop�sito:</strong> {voto.proposito}</p>
          <p><strong>Monto Total:</strong> {formatCurrency(voto.monto_total)}</p>
          <p><strong>Recaudado:</strong> {formatCurrency(voto.recaudado || 0)}</p>
          <p><strong>Pendiente:</strong> {formatCurrency(montoPendiente)}</p>
          <p><strong>Fecha L�mite:</strong> {formatDate(voto.fecha_limite)}</p>
          <p><strong>Estado:</strong> <span className={`${styles.estadoBadge} ${styles[voto.estado]}`}>{voto.estado}</span></p>
          <p><strong>Progreso:</strong> {progreso}%</p>
        </div>

        <div className={styles.votoDetalleCard}>
          <h2 className={styles.cardTitle}>Informaci�n del Miembro</h2>
          <p><strong>Nombre:</strong> {miembro?.nombres ?? '—'} {miembro?.apellidos ?? ''}</p>
          <p><strong>Cédula:</strong> {miembro?.cedula ?? '—'}</p>
          {/* Puedes a�adir m�s detalles del miembro si son necesarios */}
        </div>
      </div>

      {/* Aqu� podr�as a�adir un componente para el historial de pagos de este voto */}
      {/* <HistorialPagos votoId={voto.id} /> */}
    </div>
  )
}
