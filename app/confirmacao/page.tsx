import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'

export const metadata = {
  title: 'Inscrição Recebida — Congresso de Jovens Recife',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmacaoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const status = params.status as string | undefined
  const nome = params.nome as string | undefined
  const sexo = params.sexo as string | undefined
  const posicao = params.posicao as string | undefined
  const id = params.id as string | undefined

  const anoAtual = new Date().getFullYear()

  if (!status || !nome || !id) {
    return (
      <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/50 mb-4">Página inválida</p>
          <Link href="/" className="text-dourado-400 underline">
            Voltar ao início
          </Link>
        </div>
      </main>
    )
  }

  const confirmado = status === 'confirmado'

  return (
    <main className="min-h-screen bg-gradient-hero relative overflow-hidden flex flex-col">
      {/* Decoração */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-roxo-600/20 rounded-full blur-3xl pointer-events-none" />
      {confirmado && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-xl mx-auto w-full">
        {/* Ícone animado */}
        <div className="mb-8 animate-count-appear">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl
              ${confirmado
                ? 'bg-emerald-500/20 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20'
                : 'bg-dourado-500/20 border-2 border-dourado-500/40 animate-pulse-glow'
              }`}
          >
            {confirmado ? '📋' : '⏳'}
          </div>
        </div>

        {/* Status */}
        <div className="mb-3 animate-slide-up">
          <StatusBadge
            status={confirmado ? 'confirmado' : 'espera'}
            posicaoEspera={posicao ? Number(posicao) : null}
            size="lg"
          />
        </div>

        {/* Título */}
        <h1
          className="font-display font-black text-3xl sm:text-4xl text-center leading-tight mb-3 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          {confirmado ? (
            <>
              Inscrição{' '}
              <span className="text-gradient-gold">Recebida!</span>
            </>
          ) : (
            <>
              Na lista de{' '}
              <span className="text-dourado-400">espera!</span>
            </>
          )}
        </h1>

        {/* Mensagem */}
        <p
          className="text-white/60 text-center text-sm leading-relaxed mb-8 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          {confirmado
            ? `${nome}, sua inscrição foi registrada e será avaliada pela equipe. Aguarde a divulgação da lista nos grupos da UMADEPE.`
            : `${nome}, sua inscrição está na lista de espera${posicao ? ` (posição ${posicao})` : ''}. A supervisão divulgará a lista final nos grupos da UMADEPE e entrará em contato individualmente caso haja substituição.`}
        </p>

        {/* Card de resumo */}
        <div
          className="w-full card-glass rounded-2xl p-6 mb-8 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <h2 className="font-display font-bold text-sm text-white/60 uppercase tracking-wider mb-4">
            Resumo da Inscrição
          </h2>
          <div className="flex flex-col gap-3">
            <InfoRow label="Nome" value={nome} />
            {sexo && <InfoRow label="Sexo" value={sexo} />}
            <InfoRow label="Status" value={confirmado ? '✅ Registrada' : `⏳ Espera ${posicao ? `#${posicao}` : ''}`} />
            <InfoRow label="Evento" value={`Congresso de Jovens — Recife ${anoAtual}`} />
            <InfoRow label="Datas" value="3, 4 e 5 de julho" />
            <div className="pt-3 border-t border-white/10">
              <p className="text-white/30 text-xs">ID da inscrição: {id}</p>
            </div>
          </div>
        </div>

        {/* Aviso */}
        {confirmado ? (
          <div
            className="w-full rounded-xl bg-roxo-700/30 border border-roxo-500/30 p-4 mb-8 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-white/70 text-sm text-center">
              📋 A lista será validada pela equipe e divulgada nos grupos da UMADEPE. Fique atento às comunicações da supervisão.
            </p>
          </div>
        ) : (
          <div
            className="w-full rounded-xl bg-dourado-500/10 border border-dourado-500/20 p-4 mb-8 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-white/70 text-sm text-center">
              📋 A supervisão divulgará a lista final nos grupos da UMADEPE e entrará em contato individualmente para eventuais substituições.
            </p>
          </div>
        )}

        {/* Botão */}
        <Link
          href="/"
          className="w-full text-center py-4 px-8 rounded-2xl font-bold text-base
            bg-white/5 border border-white/10 text-white/70
            hover:bg-white/10 hover:text-white transition-all duration-200 animate-slide-up"
          style={{ animationDelay: '0.5s' }}
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-white/40 text-sm shrink-0">{label}</span>
      <span className="text-white text-sm font-medium text-right">{value}</span>
    </div>
  )
}
