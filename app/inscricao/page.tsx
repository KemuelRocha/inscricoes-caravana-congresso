import Link from 'next/link'
import { ContadorVagasClient } from '@/components/ContadorVagasClient'
import { FormularioInscricaoClient } from '@/components/FormularioInscricaoClient'

export const metadata = {
  title: 'Inscrição — Congresso de Jovens Recife',
}

export default function InscricaoPage() {
  const anoAtual = new Date().getFullYear()

  return (
    <main className="min-h-screen bg-gradient-hero relative">
      {/* Blur decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-roxo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Voltar</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">✝️</span>
          <span className="font-display font-bold text-white/60 text-sm hidden sm:block">
            Supervisão das Campanhas
          </span>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-16">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dourado-500/15 border border-dourado-500/30 mb-4">
            <span className="text-dourado-400 text-xs font-bold tracking-wider uppercase">
              Congresso de Jovens · Recife · {anoAtual}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
            Formulário de{' '}
            <span className="text-gradient-gold">Inscrição</span>
          </h1>
          <p className="text-white/50 text-sm">
            3, 4 e 5 de julho · Preencha todos os campos com atenção
          </p>
        </div>

        {/* Contador */}
        <div className="mb-8">
          <ContadorVagasClient />
        </div>

        {/* Formulário */}
        <div className="card-glass rounded-3xl p-6 sm:p-8">
          <FormularioInscricaoClient />
        </div>
      </div>
    </main>
  )
}
