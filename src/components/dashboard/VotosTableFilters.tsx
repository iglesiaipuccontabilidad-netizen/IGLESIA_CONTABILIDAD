'use client'

import React from 'react'
import styles from '@/styles/dashboard.module.css'

interface VotosTableFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
}

export default function VotosTableFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange
}: VotosTableFiltersProps) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Buscar por nombre o propósito..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="todos">Todos los estados</option>
        <option value="activo">Activos</option>
        <option value="completado">Completados</option>
        <option value="vencido">Vencidos</option>
      </select>
    </div>
  )
}