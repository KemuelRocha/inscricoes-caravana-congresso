'use client'

import dynamic from 'next/dynamic'

const FormularioInscricao = dynamic(
  () => import('./FormularioInscricao').then((m) => m.FormularioInscricao),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 rounded-xl bg-white/5" />
          <div className="h-14 rounded-xl bg-white/5" />
        </div>
        <div className="h-14 rounded-xl bg-white/5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 rounded-xl bg-white/5" />
          <div className="h-14 rounded-xl bg-white/5" />
        </div>
        <div className="h-16 rounded-xl bg-white/5" />
        <div className="h-14 rounded-2xl bg-dourado-600/20" />
      </div>
    ),
  }
)

export function FormularioInscricaoClient() {
  return <FormularioInscricao />
}
