'use server'

import { getVotoById } from '@/lib/supabase/actions';
import { Database } from '@/lib/database.types';
import { formatCurrency } from '@/utils/format';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './page.module.css';
import PagoFormContainer from '@/components/pagos/PagoFormContainer';

type TablaVotos = Database['public']['Tables']['votos']['Row'];
type TablaMiembros = Database['public']['Tables']['miembros']['Row'];

interface VotoConMiembro extends TablaVotos {
  miembro: Pick<TablaMiembros, 'id' | 'nombres' | 'apellidos'>;
}

interface PageProps {
  params: {
    votoId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const voto = await getVotoById(params.votoId) as unknown as VotoConMiembro;
  if (!voto) redirect('/dashboard/votos');

  const montoPendiente = voto.monto_total - voto.recaudado;
  const progresoRecaudacion = Math.round((voto.recaudado / voto.monto_total) * 100);

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
          <div className={styles.cardHeader}>
            <h2>Información del Voto</h2>
          </div>
          
          <div className={styles.cardBody}>
            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>Detalles del Miembro</h3>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Nombre</span>
                <span className={styles.infoValue}>{voto.miembro.nombres} {voto.miembro.apellidos}</span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>Detalles del Voto</h3>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Propósito</span>
                <span className={styles.infoValue}>{voto.proposito}</span>
              </div>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Estado</span>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Activo</span>
              </div>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Fecha Límite</span>
                <span className={styles.infoValue}>
                  {new Date(voto.fecha_limite).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>Información Financiera</h3>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Monto Total</span>
                <span className={styles.moneyHighlight}>{formatCurrency(voto.monto_total)}</span>
              </div>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Recaudado</span>
                <span className={styles.moneyHighlight}>{formatCurrency(voto.recaudado)}</span>
              </div>
              <div className={styles.infoPair}>
                <span className={styles.infoLabel}>Pendiente</span>
                <span className={styles.moneyDanger}>{formatCurrency(montoPendiente)}</span>
              </div>
              
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progresoRecaudacion}%` }}
                />
              </div>
              <div className={styles.infoPair} style={{ marginTop: '0.5rem' }}>
                <span className={styles.infoLabel}>Progreso</span>
                <span className={styles.infoValue}>{progresoRecaudacion}%</span>
              </div>
            </div>
          </div>
        </div>

        <PagoFormContainer
          votoId={voto.id}
          montoTotal={voto.monto_total}
          recaudado={voto.recaudado}
        />
      </div>
    </div>
  );
}