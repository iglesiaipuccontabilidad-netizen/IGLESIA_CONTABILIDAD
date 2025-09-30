import { createClient } from '@/lib/supabase/client'
import styles from '@/styles/components/HistorialPagos.module.css'
import type { Database } from '@/lib/database.types'

type TablaPagos = Database['public']['Tables']['pagos']['Row']

interface HistorialPagosProps {
  votoId: string
  onPagoDeleted?: () => void
}

export default async function HistorialPagos({ votoId }: HistorialPagosProps) {
  const supabase = createClient()

  const { data: pagos, error } = await supabase
    .from('pagos')
    .select(`
      id,
      monto,
      fecha_pago,
      created_at
    `)
    .eq('voto_id', votoId)
    .order('fecha_pago', { ascending: false })
    .returns<TablaPagos[]>()

  if (error) {
    return <div className={styles.error}>Error al cargar el historial de pagos</div>
  }

  if (!pagos?.length) {
    return (
      <div className={styles.historialEmpty}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        No hay pagos registrados
      </div>
    )
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
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto)
  }

  return (
    <div className={styles.historialContainer}>
      <div className={styles.pagosGrid}>
        {pagos.map((pago) => (
          <div key={pago.id} className={styles.pagoCard}>
            <div className={styles.pagoMonto}>
              {formatearMonto(pago.monto)}
            </div>
            <div className={styles.pagoFecha}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatearFecha(pago.fecha_pago)}
            </div>
            <div className={styles.pagoCreacion}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Registrado: {formatearFecha(pago.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}