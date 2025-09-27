// Tipos para los componentes del dashboard
export interface DashboardStats {
  total_comprometido: number
  total_recaudado: number
  total_pendiente: number
  votos_activos: number
}

export interface Deudor {
  id: string
  nombres: string
  apellidos: string
  monto_pendiente: number
  porcentaje_pagado: number
}

export interface VotoProximo {
  id: string
  miembro: {
    nombres: string
    apellidos: string
  }
  monto_pendiente: number
  fecha_limite: string
  dias_restantes: number
}

export interface Voto {
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