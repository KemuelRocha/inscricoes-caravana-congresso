interface StatusBadgeProps {
  status: 'confirmado' | 'espera'
  posicaoEspera?: number | null
  size?: 'sm' | 'lg'
}

export function StatusBadge({ status, posicaoEspera, size = 'sm' }: StatusBadgeProps) {
  const isLg = size === 'lg'

  if (status === 'confirmado') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold
          bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
          ${isLg ? 'px-5 py-2 text-base' : 'px-3 py-1 text-xs'}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
        CONFIRMADO
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold
        bg-dourado-500/20 text-dourado-400 border border-dourado-500/30
        ${isLg ? 'px-5 py-2 text-base' : 'px-3 py-1 text-xs'}`}
    >
      <span className="w-2 h-2 rounded-full bg-dourado-400 animate-pulse inline-block" />
      {posicaoEspera ? `ESPERA #${posicaoEspera}` : 'LISTA DE ESPERA'}
    </span>
  )
}
