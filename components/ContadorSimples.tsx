'use client'

import { useEffect, useState } from 'react'
import { ouvirVagas, VagasData, LIMITE_MASCULINO, LIMITE_FEMININO } from '@/lib/inscricoes'

export function ContadorSimples() {
  const [vagas, setVagas] = useState<VagasData | null>(null)

  useEffect(() => {
    const unsubscribe = ouvirVagas((data) => setVagas(data))
    return () => unsubscribe()
  }, [])

  if (!vagas) return null

  const totalInscritos = (vagas.masculinoConfirmados ?? 0) + (vagas.femininoConfirmados ?? 0)
  const totalVagas = LIMITE_MASCULINO + LIMITE_FEMININO
  const totalEspera = (vagas.masculinoEspera ?? 0) + (vagas.femininoEspera ?? 0)
  const esgotado = totalInscritos >= totalVagas

  return (
    <p className="text-white/30 text-xs mt-3">
      {esgotado
        ? `Vagas esgotadas · ${totalEspera} na lista de espera`
        : `${totalInscritos} de ${totalVagas} inscritos`}
      {!esgotado && totalEspera > 0 && ` · ${totalEspera} em espera`}
    </p>
  )
}
