'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatusBadge } from '@/components/StatusBadge'

interface Inscricao {
  id: string
  nomeCompleto: string
  sexo: 'Masculino' | 'Feminino'
  idade: number
  area: string
  congregacao: string
  whatsapp: string
  cartaoMembro: string
  dataNascimento: string
  status: 'confirmado' | 'espera'
  posicaoEspera: number | null
  criadoEm: string | null
}

interface VagasData {
  masculinoConfirmados: number
  femininoConfirmados: number
  masculinoEspera: number
  femininoEspera: number
}

type Tab = 'masculino' | 'feminino' | 'espera'

export default function AdminPage() {
  const [senha, setSenha] = useState('')
  const [senhaInput, setSenhaInput] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [erroSenha, setErroSenha] = useState('')

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [vagas, setVagas] = useState<VagasData | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [tabAtiva, setTabAtiva] = useState<Tab>('masculino')
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState('')

  const buscarDados = useCallback(async (senhaAtual: string) => {
    setCarregando(true)
    setErro('')
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${senhaAtual}` },
      })
      if (res.status === 401) {
        setErroSenha('Senha incorreta')
        setAutenticado(false)
        setSenha('')
        setCarregando(false)
        return
      }
      const json = await res.json()
      setInscricoes(json.inscricoes ?? [])
      setVagas(json.vagas ?? null)
    } catch {
      setErro('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (autenticado && senha) {
      buscarDados(senha)
    }
  }, [autenticado, senha, buscarDados])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!senhaInput.trim()) {
      setErroSenha('Digite a senha')
      return
    }
    setSenha(senhaInput)
    setAutenticado(true)
    setErroSenha('')
  }

  async function handleCancelar(id: string, nome: string) {
    if (!confirm(`Cancelar inscrição de ${nome}?`)) return
    setCancelando(id)
    setMensagem('')
    try {
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${senha}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMensagem(`Erro: ${json.error}`)
      } else {
        const msg = json.promovido
          ? `✅ Inscrição cancelada. ${json.promovido.nome} foi promovido(a) da lista de espera.`
          : '✅ Inscrição cancelada com sucesso.'
        setMensagem(msg)
        buscarDados(senha)
      }
    } catch {
      setMensagem('Erro ao cancelar inscrição')
    } finally {
      setCancelando(null)
    }
  }

  function handleExportarCSV() {
    const url = `/api/admin?export=csv`
    const link = document.createElement('a')
    link.href = url
    link.download = 'inscricoes.csv'

    // Fetch com header de auth e criar blob
    fetch(url, { headers: { Authorization: `Bearer ${senha}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        link.href = blobUrl
        link.click()
        URL.revokeObjectURL(blobUrl)
      })
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">🔒</span>
            <h1 className="font-display font-black text-2xl text-white mt-3">
              Painel Administrativo
            </h1>
            <p className="text-white/50 text-sm mt-1">Congresso de Jovens — Recife</p>
          </div>

          <form onSubmit={handleLogin} className="card-glass rounded-2xl p-6 flex flex-col gap-4">
            <label className="text-sm font-semibold text-white/70">Senha de acesso</label>
            <input
              type="password"
              value={senhaInput}
              onChange={(e) => {
                setSenhaInput(e.target.value)
                setErroSenha('')
              }}
              placeholder="Digite a senha"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-roxo-400 transition-all"
              autoFocus
            />
            {erroSenha && <p className="text-red-400 text-sm">{erroSenha}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-dourado-500 text-roxo-950 hover:bg-dourado-400 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    )
  }

  const confirmadosMasc = inscricoes.filter((i) => i.sexo === 'Masculino' && i.status === 'confirmado')
  const confirmadosFem = inscricoes.filter((i) => i.sexo === 'Feminino' && i.status === 'confirmado')
  const esperaMasc = inscricoes.filter((i) => i.sexo === 'Masculino' && i.status === 'espera').sort((a, b) => (a.posicaoEspera ?? 0) - (b.posicaoEspera ?? 0))
  const esperaFem = inscricoes.filter((i) => i.sexo === 'Feminino' && i.status === 'espera').sort((a, b) => (a.posicaoEspera ?? 0) - (b.posicaoEspera ?? 0))

  const listaAtiva =
    tabAtiva === 'masculino'
      ? [...confirmadosMasc]
      : tabAtiva === 'feminino'
      ? [...confirmadosFem]
      : [...esperaMasc, ...esperaFem]

  return (
    <main className="min-h-screen bg-gradient-hero">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-black text-2xl text-white">
              Painel Administrativo
            </h1>
            <p className="text-white/40 text-sm">Congresso de Jovens — Recife</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportarCSV}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-colors"
            >
              📥 Exportar CSV
            </button>
            <button
              onClick={() => buscarDados(senha)}
              disabled={carregando}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {carregando ? '⏳' : '🔄'} Atualizar
            </button>
            <button
              onClick={() => {
                setAutenticado(false)
                setSenha('')
              }}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Masc. Confirmados', value: vagas?.masculinoConfirmados ?? 0, max: 25, cor: 'blue' },
            { label: 'Fem. Confirmadas', value: vagas?.femininoConfirmados ?? 0, max: 25, cor: 'pink' },
            { label: 'Masc. Espera', value: vagas?.masculinoEspera ?? 0, max: null, cor: 'amber' },
            { label: 'Fem. Espera', value: vagas?.femininoEspera ?? 0, max: null, cor: 'amber' },
          ].map((c) => (
            <div key={c.label} className="card-glass rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-white">{c.value}</div>
              {c.max && (
                <div className="text-white/30 text-xs">/ {c.max}</div>
              )}
              <div className="text-white/50 text-xs mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Mensagem de feedback */}
        {mensagem && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {erro}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(
            [
              { key: 'masculino', label: `👨 Masculino (${confirmadosMasc.length})` },
              { key: 'feminino', label: `👩 Feminino (${confirmadosFem.length})` },
              { key: 'espera', label: `⏳ Lista de Espera (${esperaMasc.length + esperaFem.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTabAtiva(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${tabAtiva === tab.key
                  ? 'bg-roxo-600 text-white shadow-lg shadow-roxo-600/30'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabela */}
        {carregando ? (
          <div className="text-center py-16 text-white/40">Carregando...</div>
        ) : tabAtiva === 'espera' ? (
          <div className="flex flex-col gap-6">
            <TabelaEspera
              titulo="👨 Masculino"
              corHeader="border-blue-500/20 bg-blue-500/5"
              corNum="text-blue-400"
              lista={esperaMasc}
              cancelando={cancelando}
              onCancelar={handleCancelar}
            />
            <TabelaEspera
              titulo="👩 Feminino"
              corHeader="border-pink-500/20 bg-pink-500/5"
              corNum="text-pink-400"
              lista={esperaFem}
              cancelando={cancelando}
              onCancelar={handleCancelar}
            />
          </div>
        ) : listaAtiva.length === 0 ? (
          <div className="text-center py-16 text-white/30 card-glass rounded-2xl">
            Nenhuma inscrição nesta categoria
          </div>
        ) : (
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-white/40 font-semibold">Nome</th>
                    <th className="text-left px-4 py-3 text-white/40 font-semibold hidden sm:table-cell">Área</th>
                    <th className="text-left px-4 py-3 text-white/40 font-semibold hidden md:table-cell">Congregação</th>
                    <th className="text-left px-4 py-3 text-white/40 font-semibold hidden lg:table-cell">WhatsApp</th>
                    <th className="text-left px-4 py-3 text-white/40 font-semibold hidden sm:table-cell">Idade</th>
                    <th className="text-left px-4 py-3 text-white/40 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-white/40 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {listaAtiva.map((i) => (
                    <tr
                      key={i.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-medium">{i.nomeCompleto}</td>
                      <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{i.area}</td>
                      <td className="px-4 py-3 text-white/60 hidden md:table-cell">{i.congregacao}</td>
                      <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{i.whatsapp}</td>
                      <td className="px-4 py-3 text-white/70 hidden sm:table-cell">{i.idade}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={i.status} posicaoEspera={i.posicaoEspera} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCancelar(i.id, i.nomeCompleto)}
                          disabled={cancelando === i.id}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                        >
                          {cancelando === i.id ? '...' : 'Cancelar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function TabelaEspera({
  titulo,
  corHeader,
  corNum,
  lista,
  cancelando,
  onCancelar,
}: {
  titulo: string
  corHeader: string
  corNum: string
  lista: Inscricao[]
  cancelando: string | null
  onCancelar: (id: string, nome: string) => void
}) {
  return (
    <div className={`card-glass rounded-2xl overflow-hidden border ${corHeader}`}>
      <div className={`px-4 py-3 border-b border-white/10 ${corHeader}`}>
        <span className="font-bold text-white text-sm">{titulo}</span>
        <span className="ml-2 text-white/40 text-xs">({lista.length} na fila)</span>
      </div>
      {lista.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">Nenhum na lista de espera</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/40 font-semibold">#</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold">Nome</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold hidden sm:table-cell">Área</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold hidden md:table-cell">Congregação</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold hidden lg:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold hidden sm:table-cell">Idade</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((i) => (
                <tr key={i.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className={`px-4 py-3 font-black text-lg ${corNum}`}>
                    {i.posicaoEspera}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{i.nomeCompleto}</td>
                  <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{i.area}</td>
                  <td className="px-4 py-3 text-white/60 hidden md:table-cell">{i.congregacao}</td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{i.whatsapp}</td>
                  <td className="px-4 py-3 text-white/70 hidden sm:table-cell">{i.idade}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onCancelar(i.id, i.nomeCompleto)}
                      disabled={cancelando === i.id}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      {cancelando === i.id ? '...' : 'Cancelar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
