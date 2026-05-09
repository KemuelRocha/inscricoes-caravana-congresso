'use client'

import dynamic from 'next/dynamic'

const ContadorSimples = dynamic(
  () => import('./ContadorSimples').then((m) => m.ContadorSimples),
  { ssr: false }
)

export function ContadorSimplesClient() {
  return <ContadorSimples />
}
