'use client'

import dynamic from 'next/dynamic'

const ContadorVagas = dynamic(
  () => import('./ContadorVagas').then((m) => m.ContadorVagas),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
        <div className="w-40 h-40 rounded-full bg-white/5 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </div>
    ),
  }
)

export function ContadorVagasClient() {
  return <ContadorVagas />
}
