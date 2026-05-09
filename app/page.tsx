import Link from 'next/link'
import { ContadorSimplesClient } from '@/components/ContadorSimplesClient'

export default function HomePage() {
  const anoAtual = new Date().getFullYear()

  return (
    <main className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Partículas decorativas de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="particle bg-dourado-500"
          style={{ top: '10%', left: '5%', animationDelay: '0s', width: 6, height: 6 }}
        />
        <div
          className="particle bg-roxo-400"
          style={{ top: '20%', right: '8%', animationDelay: '1.5s', width: 8, height: 8 }}
        />
        <div
          className="particle bg-dourado-400"
          style={{ top: '60%', left: '3%', animationDelay: '3s', width: 5, height: 5 }}
        />
        <div
          className="particle bg-roxo-300"
          style={{ bottom: '20%', right: '5%', animationDelay: '2s', width: 7, height: 7 }}
        />
        <div
          className="particle bg-dourado-500"
          style={{ bottom: '10%', left: '15%', animationDelay: '4s', width: 4, height: 4 }}
        />

        {/* Círculos de blur decorativos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-roxo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-dourado-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-roxo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✝️</span>
          <span className="font-display font-bold text-white/80 text-sm">
            Supervisão das Campanhas
          </span>
        </div>
        <Link
          href="/admin"
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          Admin
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-8 pb-16 max-w-5xl mx-auto">
        {/* Badge do evento */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dourado-500/15 border border-dourado-500/30 mb-6 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-dourado-400 animate-pulse" />
          <span className="text-dourado-400 text-xs font-bold tracking-wider uppercase">
            3, 4 e 5 de Julho · Recife · {anoAtual}
          </span>
        </div>

        {/* Mensagem principal */}
        <div
          className="font-display font-black text-white leading-tight mb-2 animate-slide-up"
          style={{ animationDelay: '0.1s', fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
        >
          <span className="text-dourado-400">A PAZ DO SENHOR JOVENS!</span>
        </div>
        <div
          className="font-display font-black leading-tight mb-6 animate-slide-up"
          style={{ animationDelay: '0.2s', fontSize: 'clamp(1.6rem, 7vw, 4rem)' }}
        >
          <span className="animate-shimmer-text">🚨 VEM AÍ</span>
          <br />
          <span className="text-white">CONGRESSO DE JOVENS</span>
          <br />
          <span className="text-gradient-gold glow-gold">EM RECIFE</span>
        </div>

        {/* Info cards */}
        <div
          className="grid grid-cols-3 gap-3 w-full max-w-md mb-10 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          {[
            { icon: '📅', label: '3 a 5 de Julho' },
            { icon: '📍', label: 'Recife, PE' },
            { icon: '🎯', label: '50 participantes' },
          ].map((item) => (
            <div
              key={item.label}
              className="card-glass rounded-xl p-3 flex flex-col items-center gap-1"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white/70 text-xs font-medium text-center leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            href="/inscricao"
            className="flex-1 text-center py-4 px-8 rounded-2xl font-black text-lg
              bg-gradient-to-r from-dourado-600 to-dourado-500 text-roxo-950
              hover:from-dourado-500 hover:to-dourado-400
              shadow-xl shadow-dourado-600/40 animate-pulse-glow
              transition-all duration-200 active:scale-95"
          >
            QUERO ME INSCREVER 🔥
          </Link>
        </div>

        <p className="text-white/30 text-xs mt-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          Vagas limitadas · Mesmo com vagas esgotadas, você pode entrar na lista de espera
        </p>
        <p className="text-white/20 text-xs mt-1 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          Menores de 18 anos não podem participar
        </p>

        {/* Contador discreto */}
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <ContadorSimplesClient />
        </div>
      </section>

      {/* Rodapé */}
      <footer className="relative z-10 text-center pb-8 px-6">
        <p className="text-white/20 text-xs">
          Supervisão das Campanhas · Congresso de Jovens {anoAtual}
        </p>
      </footer>
    </main>
  )
}
