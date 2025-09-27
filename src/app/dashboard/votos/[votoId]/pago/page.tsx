import { getVotoById } from '@/lib/supabase/actions'
import { Database } from '@/lib/database.types'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import styles from './page.module.css'
import PagoForm from './PagoForm'

type TablaVotos = Database['public']['Tables']['votos']['Row']
type TablaMiembros = Database['public']['Tables']['miembros']['Row']

interface VotoConMiembro extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos'>
}

export default async function RegistrarPagoPage({ params }: { params: { votoId: string } }): Promise<JSX.Element> {
  const voto = await getVotoById(params.votoId) as unknown as VotoConMiembro
  if (!voto) redirect('/dashboard/votos')

  const montoPendiente = voto.monto_total - voto.recaudado

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Registrar Pago</h1>
        <Link 
          href={`/dashboard/votos/${voto.id}`} 
          className={styles.backButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver a Detalles
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.infoCard}>
          <h2>Información del Voto</h2>
          <p><strong>Miembro:</strong> {voto.miembro.nombres} {voto.miembro.apellidos}</p>
          <p><strong>Propósito:</strong> {voto.proposito}</p>
          <p><strong>Monto Total:</strong> {formatCurrency(voto.monto_total)}</p>
          <p><strong>Recaudado:</strong> {formatCurrency(voto.recaudado)}</p>
          <p><strong>Pendiente:</strong> {formatCurrency(montoPendiente)}</p>
        </div>

                <PagoForm
          votoId={voto.id}
          voto={{
            id: voto.id,
            monto: voto.monto_total,
            monto_pagado: voto.recaudado
          }}
        />
      </div>
    </div>
  )
}