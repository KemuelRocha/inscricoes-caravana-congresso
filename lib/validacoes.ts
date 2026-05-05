const ANO_ATUAL = new Date().getFullYear()
export const DATA_CORTE = new Date(ANO_ATUAL, 6, 3) // 3 de julho (mês 6 = julho, índice 0)
export const IDADE_MINIMA = 18

export function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0
  const nascimento = new Date(dataNascimento + 'T00:00:00')
  let idade = DATA_CORTE.getFullYear() - nascimento.getFullYear()
  const diffMes = DATA_CORTE.getMonth() - nascimento.getMonth()
  if (diffMes < 0 || (diffMes === 0 && DATA_CORTE.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

export function validarMaioridade(dataNascimento: string): boolean {
  return calcularIdade(dataNascimento) >= IDADE_MINIMA
}

export function validarWhatsapp(valor: string): boolean {
  const limpo = valor.replace(/\D/g, '')
  return limpo.length === 10 || limpo.length === 11
}

export function formatarWhatsapp(valor: string): string {
  const limpo = valor.replace(/\D/g, '').slice(0, 11)
  if (limpo.length <= 2) return limpo.length ? `(${limpo}` : ''
  if (limpo.length <= 6) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`
  if (limpo.length <= 10)
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`
  return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`
}

export interface DadosFormulario {
  area: string
  congregacao: string
  nomeCompleto: string
  whatsapp: string
  cartaoMembro: string
  sexo: 'Masculino' | 'Feminino' | ''
  dataNascimento: string
}

export interface ErrosFormulario {
  area?: string
  congregacao?: string
  nomeCompleto?: string
  whatsapp?: string
  cartaoMembro?: string
  sexo?: string
  dataNascimento?: string
  idade?: string
}

export function validarFormulario(dados: DadosFormulario): ErrosFormulario {
  const erros: ErrosFormulario = {}

  if (!dados.area.trim()) erros.area = 'Área é obrigatória'
  if (!dados.congregacao.trim()) erros.congregacao = 'Congregação é obrigatória'
  if (!dados.nomeCompleto.trim()) erros.nomeCompleto = 'Nome completo é obrigatório'
  if (!dados.whatsapp.trim()) {
    erros.whatsapp = 'WhatsApp é obrigatório'
  } else if (!validarWhatsapp(dados.whatsapp)) {
    erros.whatsapp = 'Formato inválido. Ex: (81) 99999-9999'
  }
  if (!dados.cartaoMembro.trim()) erros.cartaoMembro = 'Cartão de membro é obrigatório'
  if (!dados.sexo) erros.sexo = 'Selecione o sexo'
  if (!dados.dataNascimento) {
    erros.dataNascimento = 'Data de nascimento é obrigatória'
  } else if (!validarMaioridade(dados.dataNascimento)) {
    const idade = calcularIdade(dados.dataNascimento)
    erros.idade = `Você terá ${idade} anos em 03/07/${ANO_ATUAL}. É necessário ter 18 anos completos para se inscrever.`
  }

  return erros
}
