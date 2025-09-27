'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from '@/styles/forms.module.css'

interface PagoFormProps {
  votoId: string
  montoTotal: number
  recaudado: number
  onSuccess?: () => void
}

export default function PagoForm({ votoId, montoTotal, recaudado, onSuccess }: PagoFormProps) {
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número válido mayor a 0')
      setLoading(false)
      return
    }

    // Validar que no exceda el monto pendiente
    const montoPendiente = montoTotal - recaudado
    if (montoNum > montoPendiente) {
      setError(`El monto máximo que puede abonar es ${montoPendiente}`)
      setLoading(false)
      return
    }

    try {
      // Insertar el pago
      const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
          voto_id: votoId,
          monto: montoNum,
          fecha_pago: fecha || new Date().toISOString()
        })

      if (pagoError) throw pagoError

      // Actualizar el monto recaudado en el voto
      const { error: votoError } = await supabase
        .from('votos')
        .update({ 
          recaudado: recaudado + montoNum,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', votoId)

      if (votoError) throw votoError

      // Limpiar formulario y notificar éxito
      setMonto('')
      setFecha('')
      onSuccess?.()

    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="monto">Monto del Pago</label>
        <input
          type="number"
          id="monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          min="0"
          max={montoTotal - recaudado}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="fecha">Fecha del Pago</label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={styles.input}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Registrar Pago'}
      </button>
    </form>
  )
}