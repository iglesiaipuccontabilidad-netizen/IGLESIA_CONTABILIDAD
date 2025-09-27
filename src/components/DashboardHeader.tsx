'use client'

import React from 'react'
import styles from './DashboardHeader.module.css'

const DashboardHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>IPUC</div>
          <h1 className={styles.headerTitle}>Dashboard - Sistema de Votos</h1>
        </div>
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Admin Principal</div>
            <div className={styles.userRole}>Administrador</div>
          </div>
          <button className={styles.dropdownBtn}>Perfil </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
