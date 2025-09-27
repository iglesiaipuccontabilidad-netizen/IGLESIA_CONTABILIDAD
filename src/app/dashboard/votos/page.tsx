'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '@/styles/votos.module.css'
import { Database } from '@/lib/database.types'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

interface VotoConMiembro extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos'>
}

interface FiltrosVotos {
  busqueda: string
  proposito: string
  estado: string
}

export default function VotosPage() {
  const [votos, setVotos] = useState<VotoConMiembro[]>([])
  const [filtros, setFiltros] = useState<FiltrosVotos>({
    busqueda: '',
    proposito: '',
    estado: ''
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    cargarVotos()
  }, [])

  const cargarVotos = async () => {
    try {
      const { data, error } = await supabase
        .from('votos')
        .select(`
          *,
          miembro:miembros (
            id,
            nombres,
            apellidos
          )
        `)
        .order('fecha_limite', { ascending: true })

      if (error) throw error
      setVotos(data || [])
    } catch (error) {
      console.error('Error al cargar votos:', error)
    } finally {
      setLoading(false)
    }
  }

  const votosFiltrados = votos.filter(voto => {
    const nombreCompleto = `${voto.miembro.nombres} ${voto.miembro.apellidos}`.toLowerCase()
    const busquedaMin = filtros.busqueda.toLowerCase()
    const cumpleBusqueda = !filtros.busqueda || 
      nombreCompleto.includes(busquedaMin) || 
      voto.proposito.toLowerCase().includes(busquedaMin)
    
    const cumpleProposito = !filtros.proposito || voto.proposito === filtros.proposito
    const cumpleEstado = !filtros.estado || voto.estado === filtros.estado

    return cumpleBusqueda && cumpleProposito && cumpleEstado
  })

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto)
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calcularProgreso = (total: number, recaudado: number | null) => {
    if (!recaudado) return 0
    return Math.round((recaudado / total) * 100)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Votos</h1>
        <Link href="/dashboard/votos/nuevo" className={styles.btnPrimary}>
          Nuevo Voto
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nombre o propósito..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
          className={styles.searchInput}
        />
        <select
          value={filtros.proposito}
          onChange={(e) => setFiltros(prev => ({ ...prev, proposito: e.target.value }))}
          className={styles.select}
        >
          <option value="">Todos los propósitos</option>
          <option value="Templo">Templo</option>
          <option value="Misiones">Misiones</option>
          <option value="Evangelización">Evangelización</option>
        </select>
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
          className={styles.select}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando votos...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Propósito</th>
                <th>Monto Comprometido</th>
                <th>Monto Recaudado</th>
                <th>Progreso</th>
                <th>Fecha Límite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {votosFiltrados.map(voto => (
                <tr key={voto.id}>
                  <td>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>
                        {voto.miembro.nombres} {voto.miembro.apellidos}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.purpose}>{voto.proposito}</span>
                  </td>
                  <td>{formatearMonto(voto.monto_total)}</td>
                  <td>{formatearMonto(voto.recaudado || 0)}</td>
                  <td>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${calcularProgreso(voto.monto_total, voto.recaudado)}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {calcularProgreso(voto.monto_total, voto.recaudado)}%
                      </span>
                    </div>
                  </td>
                  <td>{formatearFecha(voto.fecha_limite)}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/dashboard/pagos/${voto.id}`}
                        className={styles.btnSecondary}
                      >
                        Registrar Pago
                      </Link>
                      <Link
                        href={`/dashboard/votos/${voto.id}`}
                        className={styles.btnSecondary}
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}