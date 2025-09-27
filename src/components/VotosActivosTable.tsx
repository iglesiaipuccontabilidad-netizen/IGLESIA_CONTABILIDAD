'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database } from '@/lib/database.types'
import styles from '@/styles/votos.module.css'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

interface VotoConMiembro extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos' | 'cedula'>
}

interface VotosActivosTableProps {
  votos: VotoConMiembro[]
}

export default function VotosActivosTable({ votos }: VotosActivosTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const indexOfLastVoto = currentPage * itemsPerPage
  const indexOfFirstVoto = indexOfLastVoto - itemsPerPage
  const currentVotos = votos.slice(indexOfFirstVoto, indexOfLastVoto)

  const totalPages = Math.ceil(votos.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
    <div className={styles.votosTableContainer}>
      {votos.length === 0 ? (
        <p>No hay votos activos que mostrar.</p>
      ) : (
        <table className={styles.votosTable}>
          <thead>
            <tr>
              <th>Propósito</th>
              <th>Miembro</th>
              <th>Monto Total</th>
              <th>Recaudado</th>
              <th>Fecha Límite</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentVotos.map((voto) => (
              <tr key={voto.id}>
                <td>{voto.proposito}</td>
                <td>{voto.miembro.nombres} {voto.miembro.apellidos} ({voto.miembro.cedula})</td>
                <td>{formatCurrency(voto.monto_total)}</td>
                <td>{formatCurrency(voto.recaudado || 0)}</td>
                <td>{formatDate(voto.fecha_limite)}</td>
                <td>
                  <span className={`${styles.estadoBadge} ${styles[voto.estado]}`}>
                    {voto.estado}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <Link href={`/votos/${voto.id}`} className={styles.btnSecondary}>
                      Ver Detalles
                    </Link>
                    <Link href={`/pagos/${voto.id}`} className={styles.btnPrimary}>
                      Registrar Pago
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? styles.activePage : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
