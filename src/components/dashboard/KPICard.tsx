import { ReactNode } from 'react'
import styles from '@/styles/dashboard.module.css'

type KPICardProps = {
  title: string
  value: string
  trend?: string
  icon: ReactNode
  type: 'comprometido' | 'recaudado' | 'pendiente' | 'votos'
}

export function KPICard({ title, value, trend, icon, type }: KPICardProps) {
  return (
    <div className={`${styles['kpi-card']} ${styles[`total-${type}`]}`}>
      <div className={styles['kpi-header']}>
        <div className={styles['kpi-title']}>{title}</div>
        <div className={`${styles['kpi-icon']} ${styles[`icon-${type}`]}`}>
          {icon}
        </div>
      </div>
      <div className={styles['kpi-value']}>{value}</div>
      {trend && <div className={styles['kpi-trend']}>{trend}</div>}
    </div>
  )
}