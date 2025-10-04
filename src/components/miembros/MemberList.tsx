import React from 'react'
import Link from 'next/link'
import styles from '@/styles/miembros.module.css'

interface Miembro {
  id: string
  nombres: string
  apellidos: string
  cedula: string
  email: string
  telefono: string
  avatar_url?: string
  estado: 'activo' | 'inactivo'
  rol: 'admin' | 'usuario' | 'pendiente'
  votos_activos: number
}

interface MemberListProps {
  miembros: Miembro[]
  onSearch: (query: string) => void
  onFilterChange: (estado: string) => void
}

export default function MemberList({ miembros, onSearch, onFilterChange }: MemberListProps) {
  return (
    <div className={styles.membersScreen}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Miembros</h1>
          <p className={styles.pageSubtitle}>
            Gestiona los miembros de la iglesia y sus votos
          </p>
        </div>
        <Link href="/dashboard/miembros/nuevo" className={styles.btnPrimary}>
          Nuevo Miembro
        </Link>
      </div>

      <div className={styles.searchSection}>
        <input
          type="search"
          placeholder="Buscar por nombre, cédula o email..."
          className={styles.searchInput}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select 
          className={styles.filterSelect}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="pendiente">Pendientes</option>
        </select>
      </div>

      <div className={styles.membersGrid}>
        {miembros.map((miembro) => (
          <div key={miembro.id} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <div className={styles.memberAvatar}>
                {miembro.avatar_url ? (
                  <img src={miembro.avatar_url} alt={`${miembro.nombres} ${miembro.apellidos}`} />
                ) : (
                  <span>{miembro.nombres[0]}{miembro.apellidos[0]}</span>
                )}
              </div>
              <div className={styles.memberInfo}>
                <h3>{`${miembro.nombres} ${miembro.apellidos}`}</h3>
                <span className={styles.memberCedula}>{miembro.cedula}</span>
              </div>
            </div>

            <div className={styles.memberDetails}>
              <div className={styles.memberDetail}>
                <span className={styles.memberDetailLabel}>Email</span>
                <span className={styles.memberDetailValue}>{miembro.email}</span>
              </div>
              <div className={styles.memberDetail}>
                <span className={styles.memberDetailLabel}>Teléfono</span>
                <span className={styles.memberDetailValue}>{miembro.telefono}</span>
              </div>
              <div className={styles.memberDetail}>
                <span className={styles.memberDetailLabel}>Estado</span>
                <span className={`${styles.memberDetailValue} ${styles[miembro.estado]}`}>
                  {miembro.estado.charAt(0).toUpperCase() + miembro.estado.slice(1)}
                </span>
              </div>
              <div className={styles.memberDetail}>
                <span className={styles.memberDetailLabel}>Rol</span>
                <span className={`${styles.memberDetailValue} ${styles[miembro.rol]}`}>
                  {miembro.rol.charAt(0).toUpperCase() + miembro.rol.slice(1)}
                </span>
              </div>
            </div>

            <div className={styles.memberActions}>
              <Link 
                href={`/miembros/${miembro.id}`}
                className={styles.btnOutline}
              >
                Ver Perfil
              </Link>
              <span className={styles.votosBadge}>
                {miembro.votos_activos} votos activos
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}