'use client'

import React from 'react'
import styles from '@/styles/dashboard.module.css'
import Link from 'next/link'
import ProgressBar from './ProgressBar'
import VotosTableFilters from './VotosTableFilters'

interface Voto {
  id: string
  miembro: {
    nombres: string
    apellidos: string
  }
  proposito: string
  monto: number
  recaudado: number
  fecha_limite: string
}

interface VotosActivosTableProps {
  votos: Voto[]
}

export default function VotosActivosTable({ votos }: VotosActivosTableProps) {
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
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={styles.votosTableContainer}>
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>Votos Activos</h2>
        <VotosTableFilters
          searchTerm={''}
          onSearchChange={() => {}}
          selectedStatus={''}
          onStatusChange={() => {}}
        />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.votosTable}>
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Propósito</th>
              <th>Monto</th>
              <th>Recaudado</th>
              <th>Progreso</th>
              <th>Fecha Límite</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {votos.map((voto) => (
              <tr key={voto.id}>
                <td>{`${voto.miembro.nombres} ${voto.miembro.apellidos}`}</td>
                <td>{voto.proposito}</td>
                <td>{formatCurrency(voto.monto)}</td>
                <td>{formatCurrency(voto.recaudado)}</td>
                <td>
                  <ProgressBar
                    progreso={(voto.recaudado / voto.monto) * 100}
                  />
                </td>
                <td>{formatDate(voto.fecha_limite)}</td>
                <td>
                  <div className={styles.tableActions}>
                    <Link href={`/pagos/${voto.id}`} className={styles.actionButton}>
                      Registrar Pago
                    </Link>
                    <Link href={`/votos/${voto.id}`} className={styles.actionButtonSecondary}>
                      Ver Detalles
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}