'use client'

import { useEffect, useState } from 'react'
import { ouvirVagas, VagasData, LIMITE_MASCULINO, LIMITE_FEMININO } from '@/lib/inscricoes'

function BarraProgresso({
  valor,
  total,
  cor,
}: {
  valor: number
  total: number
  cor: 'azul' | 'rosa'
}) {
  const pct = Math.min(100, (valor / total) * 100)
  const corClass = cor === 'azul' ? 'bg-blue-500' : 'bg-pink-500'
  const corGlow = cor === 'azul' ? 'shadow-blue-500/50' : 'shadow-pink-500/50'

  return (
    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${corClass} shadow-lg ${corGlow}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function CardGenero({
  label,
  emoji,
  confirmados,
  limite,
  espera,
  cor,
}: {
  label: string
  emoji: string
  confirmados: number
  limite: number
  espera: number
  cor: 'azul' | 'rosa'
}) {
  const restantes = Math.max(0, limite - confirmados)
  const esgotado = restantes === 0
  const bordaCor = cor === 'azul' ? 'border-blue-500/30' : 'border-pink-500/30'
  const bgCor = cor === 'azul' ? 'bg-blue-500/5' : 'bg-pink-500/5'
  const numCor = cor === 'azul' ? 'text-blue-400' : 'text-pink-400'
  const glowCor = cor === 'azul' ? 'shadow-blue-500/20' : 'shadow-pink-500/20'

  return (
    <div
      className={`relative rounded-2xl border ${bordaCor} ${bgCor} p-6 flex flex-col gap-4 shadow-xl ${glowCor} overflow-hidden`}
    >
      {esgotado && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-10">
          <div className="text-center">
            <div className="text-3xl font-black text-dourado-500 animate-pulse-glow">ESGOTADO</div>
            {espera > 0 && (
              <div className="text-white/70 text-sm mt-1">{espera} na lista de espera</div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-white/80 font-semibold text-lg">{label}</span>
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-7xl font-black leading-none tabular-nums ${numCor} animate-count-appear`}>
          {restantes}
        </span>
        <span className="text-white/50 text-sm pb-2">/ {limite} vagas</span>
      </div>

      <BarraProgresso valor={confirmados} total={limite} cor={cor} />

      <div className="flex justify-between text-xs text-white/50">
        <span>{confirmados} inscritos</span>
        {espera > 0 && <span>{espera} em espera</span>}
      </div>
    </div>
  )
}

export function ContadorVagas() {
  const [vagas, setVagas] = useState<VagasData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = ouvirVagas((data) => {
      setVagas(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const totalConfirmados =
    (vagas?.masculinoConfirmados ?? 0) + (vagas?.femininoConfirmados ?? 0)
  const totalVagas = LIMITE_MASCULINO + LIMITE_FEMININO
  const totalRestantes = Math.max(0, totalVagas - totalConfirmados)

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
        <div className="w-40 h-40 rounded-full bg-white/5 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4">
      {/* Total geral */}
      <div className="text-center">
        <div className="relative inline-block">
          <div
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center
              border-4 animate-pulse-glow
              ${totalRestantes === 0 ? 'border-red-500/60 bg-red-500/10' : 'border-dourado-500/60 bg-dourado-500/10'}`}
          >
            <span
              className={`text-5xl font-black tabular-nums leading-none
                ${totalRestantes === 0 ? 'text-red-400' : 'text-dourado-400'}`}
            >
              {totalRestantes}
            </span>
            <span className="text-white/60 text-xs mt-1 font-medium">vagas totais</span>
          </div>

          {/* Partículas decorativas */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-dourado-500 rounded-full opacity-60 animate-float" />
          <div
            className="absolute -bottom-1 -left-3 w-3 h-3 bg-roxo-400 rounded-full opacity-50 animate-float"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {totalRestantes === 0 && (
          <div className="mt-4 px-6 py-2 rounded-full bg-dourado-500/20 border border-dourado-500/30 text-dourado-400 font-bold text-sm">
            Inscreva-se na lista de espera!
          </div>
        )}
      </div>

      {/* Cards por gênero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <CardGenero
          label="Masculino"
          emoji="👨"
          confirmados={vagas?.masculinoConfirmados ?? 0}
          limite={LIMITE_MASCULINO}
          espera={vagas?.masculinoEspera ?? 0}
          cor="azul"
        />
        <CardGenero
          label="Feminino"
          emoji="👩"
          confirmados={vagas?.femininoConfirmados ?? 0}
          limite={LIMITE_FEMININO}
          espera={vagas?.femininoEspera ?? 0}
          cor="rosa"
        />
      </div>
    </div>
  )
}
