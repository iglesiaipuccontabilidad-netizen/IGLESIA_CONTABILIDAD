'use client'

import React from 'react'
// import styles from './layout.module.css'
import Sidebar from '../../components/Sidebar'
import DashboardHeader from '../../components/DashboardHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="mainContent">
        <DashboardHeader />
        <div className="contentWrapper">
          {children}
        </div>
      </main>
    </div>
  )
}
