import Link from 'next/link'
import { getVotoById } from '@/lib/supabase/actions'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/database.types'
import styles from '@/styles/components/VotoDetalle.module.css'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']
type TablaPagos = Database['public']['Tables']['pagos']['Row']

interface VotoConRelaciones extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos' | 'cedula'>
  pagos: TablaPagos[]
}

export default async function VotoDetailPage({ params }: { params: { votoId: string } }) {
  const voto = await getVotoById(params.votoId)
  if (!voto) notFound()

  const progreso = Math.round((voto.recaudado || 0) * 100 / voto.monto_total)
  const montoPendiente = voto.monto_total - (voto.recaudado || 0)

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto)
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const obtenerEstadoProgreso = (porcentaje: number) => {
    if (porcentaje >= 75) return 'success'
    if (porcentaje >= 50) return 'warning'
    return 'danger'
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard/votos" className={styles.breadcrumbLink}>
          Votos
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span>Detalle del Voto</span>
      </div>

      {/* Encabezado */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Detalle del Voto</h1>
        <Link
          href={`/dashboard/pagos/${voto.id}`}
          className="btn-primary"
        >
          Registrar Pago
        </Link>
      </header>

      {/* Tarjeta de resumen */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>{voto.proposito}</h2>
            <p className={styles.cardSubtitle}>
              Fecha límite: {formatearFecha(voto.fecha_limite)}
            </p>
          </div>
        </div>

        <div className={styles.memberInfo}>
          <div className={styles.memberAvatar}>
            {voto.miembro.nombres[0]}{voto.miembro.apellidos[0]}
          </div>
          <div className={styles.memberDetails}>
            <h3>{voto.miembro.nombres} {voto.miembro.apellidos}</h3>
            <span className={styles.memberCedula}>CC: {voto.miembro.cedula}</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de progreso */}
      <div className={styles.progressCard}>
        <div className={styles.progressInfo}>
          <div className={styles.progressDetail}>
            <span className={styles.progressLabel}>Monto Total</span>
            <span className={styles.progressValue}>
              {formatearMonto(voto.monto_total)}
            </span>
          </div>
          <div className={styles.progressDetail}>
            <span className={styles.progressLabel}>Recaudado</span>
            <span className={styles.progressValue}>
              {formatearMonto(voto.recaudado || 0)}
            </span>
          </div>
          <div className={styles.progressDetail}>
            <span className={styles.progressLabel}>Pendiente</span>
            <span className={styles.progressValue}>
              {formatearMonto(montoPendiente)}
            </span>
          </div>
        </div>

        <div className={styles.progressBarContainer}>
          <div 
            className={`${styles.progressBarFill} ${styles[obtenerEstadoProgreso(progreso)]}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
        <div className={styles.progressBarLabel}>{progreso}% completado</div>
      </div>

      {/* Historial de pagos */}
      <div className={styles.paymentsCard}>
        <div className={styles.paymentsHeader}>
          <h2 className={styles.paymentsTitle}>Historial de Pagos</h2>
        </div>

        {voto.pagos && voto.pagos.length > 0 ? (
          <table className={styles.paymentsTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Registrado por</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {voto.pagos.map((pago) => (
                <tr key={pago.id}>
                  <td className={styles.date}>
                    {formatearFecha(pago.fecha_pago)}
                  </td>
                  <td className={styles.amount}>
                    {formatearMonto(pago.monto)}
                  </td>
                  <td>{pago.registrado_por}</td>
                  <td>{pago.nota || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay pagos registrados aún.</p>
        )}
      </div>
    </div>
  )
}
