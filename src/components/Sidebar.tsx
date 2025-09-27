﻿"use client"

import * as React from "react";
import { usePathname } from "next/navigation"
import Link from "next/link"
import styles from "@/styles/sidebar.module.css"
import { useAuth } from "@/lib/context/AuthContext"

export default function Sidebar() {
  const pathname = usePathname()
  const { member } = useAuth()

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className={"icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      href: "/dashboard/votos",
      label: "Votos",
      icon: (
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      subItems: [
        {
          href: "/dashboard/votos/nuevo",
          label: "Nuevo Voto"
        }
      ]
    },
    {
      href: "/dashboard/miembros",
      label: "Miembros",
      icon: (
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      subItems: [
        {
          href: "/dashboard/miembros/nuevo",
          label: "Nuevo Miembro"
        }
      ]
    }
  ]

  // Solo mostrar el menú de administración si el usuario es admin
  if (member?.rol === "admin") {
    menuItems.push({
      href: "/dashboard/admin/usuarios",
      label: "Gestión de Usuarios",
      icon: (
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    })
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>IPUC</span>
      </div>

      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>

              {item.subItems && (
                <ul className={styles.subNavList}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.href} className={styles.subNavItem}>
                      <Link
                        href={subItem.href}
                        className={`${styles.subNavLink} ${
                          pathname === subItem.href ? styles.active : ""
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
