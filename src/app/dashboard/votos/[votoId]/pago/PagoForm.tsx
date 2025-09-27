'use client';
import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { procesarPago } from './pago-actions';
import { formatCurrency } from '@/utils/format';

interface PagoFormProps {
  votoId: string;
  voto: {
    id: string;
    monto: number;
    monto_pagado: number;
  };
}

interface ActionResponse {
  error: string | null;
  success: boolean;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? 'Registrando...' : 'Registrar Pago'}
    </button>
  );
};

const PagoForm = ({ votoId, voto }: PagoFormProps) => {
  const montoPendiente = voto.monto - voto.monto_pagado;

  const [state, formAction] = useFormState(
    async (prevState: ActionResponse | undefined, formData: FormData): Promise<ActionResponse> => {
      return procesarPago(votoId, formData);
    },
    { error: null, success: false }
  );

  useEffect(() => {
    if (state?.success) {
      redirect(`/dashboard/votos/${votoId}`);
    }
  }, [state?.success, votoId]);

  return (
    <>
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{state.error}</h3>
            </div>
          </div>
        </div>
      )}

      <form 
        action={formAction}
        className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto transition-shadow hover:shadow-md"
      >
        <div className="mb-8">
          <label htmlFor="monto" className="block text-sm font-semibold text-gray-700 mb-2">Monto a Pagar</label>
          <div className="relative flex items-stretch rounded-md shadow-sm">
            <span className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-500 text-sm border border-r-0 border-gray-300 rounded-l-md">$</span>
            <input
              type="number"
              id="monto"
              name="monto"
              min="1"
              max={montoPendiente}
              required
              className="flex-1 rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Monto máximo: {formatCurrency(montoPendiente)}
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="nota" className="block text-sm font-semibold text-gray-700 mb-2">Nota (opcional)</label>
          <textarea
            id="nota"
            name="nota"
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Agregar notas o comentarios sobre el pago..."
          />
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
          <Link 
            href={`/dashboard/votos/${votoId}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </Link>
          <SubmitButton />
        </div>
      </form>
    </>
  );
};

export default PagoForm;
