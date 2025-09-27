'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/votos.module.css'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface MiembroOption {
  id: string
  nombres: string
  apellidos: string
}

export default function NuevoVotoPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [miembros, setMiembros] = React.useState<MiembroOption[]>([])
  const [formData, setFormData] = React.useState({
    proposito: '',
    montoTotal: '',
    fechaLimite: '',
    miembroId: ''
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const fetchMiembros = async () => {
      const { data, error } = await supabase
        .from('miembros')
        .select('id, nombres, apellidos')
        .order('apellidos')

      if (error) {
        console.error('Error al cargar miembros:', error)
        return
      }

      setMiembros(data || [])
    }

    fetchMiembros()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('votos')
        .insert([
          {
            proposito: formData.proposito,
            monto_total: parseFloat(formData.montoTotal),
            fecha_limite: formData.fechaLimite,
            miembro_id: formData.miembroId,
            estado: 'activo',
            recaudado: 0
          }
        ])

      if (error) throw error

      router.push('/votos')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Nuevo Voto</h1>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="proposito">Propósito del Voto</label>
          <textarea
            id="proposito"
            name="proposito"
            value={formData.proposito}
            onChange={handleChange}
            required
            className={styles.textarea}
            placeholder="Describe el propósito del voto..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="montoTotal">Monto Total (COP)</label>
          <input
            type="number"
            id="montoTotal"
            name="montoTotal"
            value={formData.montoTotal}
            onChange={handleChange}
            required
            min="0"
            className={styles.input}
            placeholder="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fechaLimite">Fecha Límite</label>
          <input
            type="date"
            id="fechaLimite"
            name="fechaLimite"
            value={formData.fechaLimite}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="miembroId">Miembro</label>
          <select
            id="miembroId"
            name="miembroId"
            value={formData.miembroId}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Selecciona un miembro</option>
            {miembros.map(miembro => (
              <option key={miembro.id} value={miembro.id}>
                {`${miembro.apellidos}, ${miembro.nombres}`}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.btnSecondary}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Crear Voto'}
          </button>
        </div>
      </form>
    </div>
  )
}