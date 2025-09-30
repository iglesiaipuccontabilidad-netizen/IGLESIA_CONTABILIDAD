'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import tableStyles from '@/styles/components/Table.module.css'
import headerStyles from '@/styles/components/Header.module.css'
import loadingStyles from '@/styles/components/Loading.module.css'
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
  const supabase = createClient()

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
    <div className="container">
      <div className={headerStyles.header}>
        <h1 className={headerStyles.title}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            <path d="m8 12 2 2 4-4"/>
          </svg>
          Votos
        </h1>
        <Link href="/dashboard/votos/nuevo" className={headerStyles.buttonPrimary}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Voto
        </Link>
      </div>

      <div className={headerStyles.filters}>
        <input
          type="text"
          placeholder="Buscar por nombre o propósito..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
          className={headerStyles.searchInput}
        />
        <select
          value={filtros.proposito}
          onChange={(e) => setFiltros(prev => ({ ...prev, proposito: e.target.value }))}
          className={headerStyles.select}
        >
          <option value="">Todos los propósitos</option>
          <option value="Templo">Templo</option>
          <option value="Misiones">Misiones</option>
          <option value="Evangelización">Evangelización</option>
        </select>
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
          className={headerStyles.select}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      {loading ? (
        <div className={loadingStyles.loading}>
          <div className={loadingStyles.spinner} />
          Cargando votos...
        </div>
      ) : (
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Propósito</th>
                <th>Monto Comprometido</th>
                <th>Monto Recaudado</th>
                <th>Progreso</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {votosFiltrados.map(voto => (
                <tr key={voto.id}>
                  <td>
                    <div className={tableStyles.memberInfo}>
                      <span className={tableStyles.memberName}>
                        {voto.miembro.nombres} {voto.miembro.apellidos}
                      </span>
                    </div>
                  </td>
                  <td>{voto.proposito}</td>
                  <td className={tableStyles.currency}>{formatearMonto(voto.monto_total)}</td>
                  <td className={tableStyles.currency}>{formatearMonto(voto.recaudado || 0)}</td>
                  <td>
                    <div className={tableStyles.progressContainer}>
                      <div className={tableStyles.progressBar}>
                        <div 
                          className={tableStyles.progressFill}
                          style={{ width: `${calcularProgreso(voto.monto_total, voto.recaudado)}%` }}
                        />
                      </div>
                      <span className={tableStyles.progressText}>
                        {calcularProgreso(voto.monto_total, voto.recaudado)}%
                      </span>
                    </div>
                  </td>
                  <td>{formatearFecha(voto.fecha_limite)}</td>
                  <td>
                    <span className={tableStyles[`badge${voto.estado.charAt(0).toUpperCase() + voto.estado.slice(1)}`]}>
                      {voto.estado}
                    </span>
                  </td>
                  <td>
                    <div className={tableStyles.actions}>
                      <Link
                        href={`/dashboard/pagos/${voto.id}`}
                        className={tableStyles.primaryButton}
                      >
                        Registrar Pago
                      </Link>
                      <Link
                        href={`/dashboard/votos/${voto.id}`}
                        className={tableStyles.secondaryButton}
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