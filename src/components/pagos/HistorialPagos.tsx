import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from '@/styles/pagos.module.css'

interface HistorialPagosProps {
  votoId: string
  onPagoDeleted?: () => void
}

export default async function HistorialPagos({ votoId }: HistorialPagosProps) {
  const supabase = createClientComponentClient()

  const { data: pagos, error } = await supabase
    .from('pagos')
    .select(`
      id,
      monto,
      fecha_pago,
      creado_en
    `)
    .eq('voto_id', votoId)
    .order('fecha_pago', { ascending: false })

  if (error) {
    return <div className={styles.error}>Error al cargar el historial de pagos</div>
  }

  if (!pagos?.length) {
    return <div className={styles.empty}>No hay pagos registrados</div>
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto)
  }

  return (
    <div className={styles.historialContainer}>
      <h3>Historial de Pagos</h3>
      <div className={styles.pagosGrid}>
        {pagos.map((pago) => (
          <div key={pago.id} className={styles.pagoCard}>
            <div className={styles.pagoMonto}>
              {formatearMonto(pago.monto)}
            </div>
            <div className={styles.pagoFecha}>
              {formatearFecha(pago.fecha_pago)}
            </div>
            <div className={styles.pagoCreacion}>
              Registrado: {formatearFecha(pago.creado_en)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}