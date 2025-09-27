import Link from 'next/link'
import LogoutButton from './LogoutButton'
import styles from '@/styles/header.module.css'

type HeaderProps = {
  userName: string
  userRole: string
  currentPage: string
}

export function Header({ userName, userRole, currentPage }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles['header-content']}>
        <div className={styles['logo-section']}>
          <div className={styles.logo}>IPUC</div>
          <div>
            <h1 className={styles['header-title']}>Sistema de Votos IPUC</h1>
            <div className={styles.breadcrumb}>
              <Link href="/dashboard">Inicio</Link> / {currentPage}
            </div>
          </div>
        </div>

        <div className={styles['user-menu']}>
          <div className={styles['user-info']}>
            <div className={styles['user-name']}>{userName}</div>
            <div className={styles['user-role']}>{userRole}</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}