'use client'

import React from 'react'
import PagoForm from './PagoForm'

interface PagoFormContainerProps {
  votoId: string
  montoTotal: number
  recaudado: number
}

function PagoFormContainer({ votoId, montoTotal, recaudado }: PagoFormContainerProps) {
  return (
    <PagoForm
      votoId={votoId}
      montoTotal={montoTotal}
      recaudado={recaudado}
    />
  )
}

export default PagoFormContainer