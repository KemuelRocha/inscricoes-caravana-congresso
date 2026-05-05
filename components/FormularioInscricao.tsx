'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  DadosFormulario,
  ErrosFormulario,
  validarFormulario,
  formatarWhatsapp,
  calcularIdade,
  validarMaioridade,
} from '@/lib/validacoes'
import { areasData } from '@/data/congregacoes'

const dadosIniciais: DadosFormulario = {
  area: '',
  congregacao: '',
  nomeCompleto: '',
  whatsapp: '',
  cartaoMembro: '',
  sexo: '',
  dataNascimento: '',
}

function Campo({
  label,
  erro,
  children,
  required,
}: {
  label: string
  erro?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white/80">
        {label}
        {required && <span className="text-dourado-500 ml-1">*</span>}
      </label>
      {children}
      {erro && <p className="text-red-400 text-xs mt-0.5">{erro}</p>}
    </div>
  )
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-roxo-400 focus:bg-white/10 transition-all duration-200'

const inputErroClass =
  'w-full bg-red-500/5 border border-red-500/40 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-400 transition-all duration-200'

const IDEMPOTENCY_STORAGE_KEY = 'inscricao:idempotency-key'

function criarIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function obterIdempotencyKey(): string {
  const existente = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY)
  if (existente) return existente

  const nova = criarIdempotencyKey()
  sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, nova)
  return nova
}

export function FormularioInscricao() {
  const router = useRouter()
  const [dados, setDados] = useState<DadosFormulario>(dadosIniciais)
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [idadeCalculada, setIdadeCalculada] = useState<number | null>(null)
  const [menorDeIdade, setMenorDeIdade] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroGlobal, setErroGlobal] = useState('')
  const submitBloqueadoRef = useRef(false)

  const anoAtual = new Date().getFullYear()

  useEffect(() => {
    if (!dados.dataNascimento) {
      setIdadeCalculada(null)
      setMenorDeIdade(false)
      return
    }
    const idade = calcularIdade(dados.dataNascimento)
    setIdadeCalculada(idade)
    setMenorDeIdade(!validarMaioridade(dados.dataNascimento))
  }, [dados.dataNascimento])

  const congregacoesDisponiveis = dados.area
    ? (areasData[Number(dados.area)]?.congregacoes ?? [])
    : []

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (!submitBloqueadoRef.current) {
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY)
    }

    if (name === 'whatsapp') {
      const formatado = formatarWhatsapp(value)
      setDados((prev) => ({ ...prev, whatsapp: formatado }))
    } else if (name === 'area') {
      // Resetar congregação ao trocar área
      setDados((prev) => ({ ...prev, area: value, congregacao: '' }))
      setErros((prev) => ({ ...prev, area: undefined, congregacao: undefined }))
      setErroGlobal('')
      return
    } else {
      setDados((prev) => ({ ...prev, [name]: value }))
    }

    if (erros[name as keyof ErrosFormulario]) {
      setErros((prev) => ({ ...prev, [name]: undefined }))
    }
    setErroGlobal('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitBloqueadoRef.current) return
    submitBloqueadoRef.current = true

    const novosErros = validarFormulario(dados)
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      const primeiroCampo = Object.keys(novosErros)[0]
      const el = document.querySelector(`[name="${primeiroCampo}"]`) as HTMLElement
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      submitBloqueadoRef.current = false
      return
    }

    setEnviando(true)
    setErroGlobal('')

    try {
      const idempotencyKey = obterIdempotencyKey()
      const res = await fetch('/api/inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(dados),
      })

      const json = await res.json()

      if (!res.ok) {
        setErroGlobal(json.error ?? 'Erro ao processar inscrição')
        setEnviando(false)
        submitBloqueadoRef.current = false
        return
      }

      const params = new URLSearchParams({
        status: json.status,
        nome: json.nome,
        sexo: json.sexo,
        id: json.id,
        ...(json.posicaoEspera ? { posicao: String(json.posicaoEspera) } : {}),
      })

      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY)
      router.push(`/confirmacao?${params.toString()}`)
    } catch {
      setErroGlobal('Erro de conexão. Verifique sua internet e tente novamente.')
      setEnviando(false)
      submitBloqueadoRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Área e Congregação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Área" erro={erros.area} required>
          <select
            name="area"
            value={dados.area}
            onChange={handleChange}
            className={erros.area ? inputErroClass : inputClass}
          >
            <option value="" disabled>Selecione a área</option>
            {Object.keys(areasData).map((num) => (
              <option key={num} value={num}>
                Área {num}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Congregação" erro={erros.congregacao} required>
          <select
            name="congregacao"
            value={dados.congregacao}
            onChange={handleChange}
            disabled={!dados.area}
            className={`${erros.congregacao ? inputErroClass : inputClass} ${!dados.area ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <option value="" disabled>
              {dados.area ? 'Selecione a congregação' : 'Selecione a área primeiro'}
            </option>
            {congregacoesDisponiveis.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      {/* Nome Completo */}
      <Campo label="Nome Completo" erro={erros.nomeCompleto} required>
        <input
          name="nomeCompleto"
          value={dados.nomeCompleto}
          onChange={handleChange}
          placeholder="Seu nome completo"
          className={erros.nomeCompleto ? inputErroClass : inputClass}
        />
      </Campo>

      {/* WhatsApp e Cartão */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="WhatsApp" erro={erros.whatsapp} required>
          <input
            name="whatsapp"
            type="tel"
            value={dados.whatsapp}
            onChange={handleChange}
            placeholder="(81) 99999-9999"
            inputMode="numeric"
            className={erros.whatsapp ? inputErroClass : inputClass}
          />
        </Campo>
        <Campo label="Cartão de Membro" erro={erros.cartaoMembro} required>
          <input
            name="cartaoMembro"
            value={dados.cartaoMembro}
            onChange={handleChange}
            placeholder="Número do cartão"
            className={erros.cartaoMembro ? inputErroClass : inputClass}
          />
        </Campo>
      </div>

      {/* Sexo */}
      <Campo label="Sexo" erro={erros.sexo} required>
        <div className="grid grid-cols-2 gap-3">
          {(['Masculino', 'Feminino'] as const).map((opcao) => (
            <label
              key={opcao}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 cursor-pointer border transition-all duration-200
                ${
                  dados.sexo === opcao
                    ? opcao === 'Masculino'
                      ? 'bg-blue-500/20 border-blue-500/60 text-blue-300'
                      : 'bg-pink-500/20 border-pink-500/60 text-pink-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                }`}
            >
              <input
                type="radio"
                name="sexo"
                value={opcao}
                checked={dados.sexo === opcao}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="text-xl">{opcao === 'Masculino' ? '👨' : '👩'}</span>
              <span className="font-semibold">{opcao}</span>
            </label>
          ))}
        </div>
        {erros.sexo && <p className="text-red-400 text-xs mt-0.5">{erros.sexo}</p>}
      </Campo>

      {/* Data de Nascimento e Idade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Data de Nascimento" erro={erros.dataNascimento} required>
          <input
            name="dataNascimento"
            type="date"
            value={dados.dataNascimento}
            onChange={handleChange}
            max={`${anoAtual - 10}-12-31`}
            className={erros.dataNascimento ? inputErroClass : inputClass}
          />
        </Campo>

        <Campo label={`Idade em 03/07/${anoAtual}`}>
          <div
            className={`w-full rounded-xl px-4 py-3 font-bold text-xl text-center
              ${
                idadeCalculada === null
                  ? 'bg-white/5 border border-white/10 text-white/30'
                  : menorDeIdade
                  ? 'bg-red-500/10 border border-red-500/40 text-red-400'
                  : 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400'
              }`}
          >
            {idadeCalculada === null ? '— anos' : `${idadeCalculada} anos`}
          </div>
        </Campo>
      </div>

      {/* Alerta menor de idade */}
      {menorDeIdade && erros.idade && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-red-400 mb-1">Inscrição não permitida</p>
              <p>{erros.idade}</p>
              <p className="mt-1 text-white/50">
                O evento é voltado para maiores de 18 anos completos até 03/07/{anoAtual}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Erro global */}
      {erroGlobal && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
          {erroGlobal}
        </div>
      )}

      {/* Botão submit */}
      <button
        type="submit"
        disabled={enviando || menorDeIdade}
        className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-200
          ${
            menorDeIdade
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : enviando
              ? 'bg-roxo-600/50 text-white/50 cursor-wait'
              : 'bg-gradient-to-r from-dourado-600 to-dourado-500 text-roxo-950 hover:from-dourado-500 hover:to-dourado-400 shadow-lg shadow-dourado-600/30 active:scale-95'
          }`}
      >
        {enviando ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processando...
          </span>
        ) : menorDeIdade ? (
          'Inscrição não disponível'
        ) : (
          'GARANTIR MINHA VAGA 🔥'
        )}
      </button>

      <p className="text-white/30 text-xs text-center">
        * Campos obrigatórios. Ao se inscrever, você confirma que as informações são verdadeiras.
      </p>
    </form>
  )
}
