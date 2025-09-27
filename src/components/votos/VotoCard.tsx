import React from 'react'
import Link from 'next/link'
import styles from '@/styles/votos.module.css'

interface VotoCardProps {
  voto: {
    id: string
    proposito: string
    montoTotal: number
    recaudado: number
    fechaLimite: string
    estado: 'activo' | 'completado' | 'vencido'
    miembro: {
      nombres: string
      apellidos: string
    }
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const VotoCard: React.FC<VotoCardProps> = ({ voto }) => {
  const progress = (voto.recaudado / voto.montoTotal) * 100
  const pendiente = voto.montoTotal - voto.recaudado

  return (
    <div className={styles.votoCard}>
      <div className={styles.votoHeader}>
        <h3 className={styles.votoProposito}>{voto.proposito}</h3>
        <p className={styles.votoMiembro}>
          {voto.miembro.nombres} {voto.miembro.apellidos}
        </p>
      </div>

      <div className={styles.votoInfo}>
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>Meta</div>
          <div className={styles.infoValue}>{formatCurrency(voto.montoTotal)}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>Recaudado</div>
          <div className={styles.infoValue}>{formatCurrency(voto.recaudado)}</div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={styles.infoLabel}>
        Pendiente: {formatCurrency(pendiente)}
      </p>

      <div className={styles.votoFooter}>
        <span className={`${styles.votoEstado} ${styles[`estado${voto.estado.charAt(0).toUpperCase() + voto.estado.slice(1)}`]}`}>
          {voto.estado.toUpperCase()}
        </span>
        <span className={styles.infoLabel}>
          Vence: {formatDate(voto.fechaLimite)}
        </span>
      </div>

      <Link href={`/votos/${voto.id}`}>
        <button className={styles.btnAcciones}>
          Ver Detalles
        </button>
      </Link>
    </div>
  )
}

export default VotoCard