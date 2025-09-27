'use client'

import React from 'react'
import styles from '@/styles/dashboard.module.css'

interface ProgressBarProps {
  progreso: number
  colorClass?: string
}

export default function ProgressBar({ progreso, colorClass }: ProgressBarProps) {
  return (
    <div className={styles.progresoCell}>
      <div className={styles.progresoBar}>
        <div 
          className={`${styles.progresoFill} ${colorClass}`}
          style={{ width: `${progreso}%` }}
        />
      </div>
      <div className={styles.progresoPorcentaje}>{progreso}%</div>
    </div>
  )
}