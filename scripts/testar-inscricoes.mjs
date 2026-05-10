const BASE_URL = 'http://localhost:3000/api/inscricao'

const masculinos = [
  { nomeCompleto: 'Carlos Eduardo Lima', cartaoMembro: 'CM001', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Rafael Souza Mendes', cartaoMembro: 'CM002', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Lucas Oliveira Costa', cartaoMembro: 'CM003', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Bruno Alves Pereira', cartaoMembro: 'CM004', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'André Ferreira Santos', cartaoMembro: 'CM005', congregacao: 'Central', area: 'Norte' },
]

const femininos = [
  { nomeCompleto: 'Ana Paula Rodrigues', cartaoMembro: 'CM006', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Mariana Gomes Silva', cartaoMembro: 'CM007', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Juliana Nascimento', cartaoMembro: 'CM008', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Fernanda Castro Lima', cartaoMembro: 'CM009', congregacao: 'Central', area: 'Norte' },
  { nomeCompleto: 'Priscila Martins Dias', cartaoMembro: 'CM010', congregacao: 'Central', area: 'Norte' },
]

function gerarKey() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

async function inscrever(pessoa, sexo, label) {
  const key = gerarKey()
  const body = {
    ...pessoa,
    sexo,
    whatsapp: '11999999999',
    dataNascimento: '2000-01-01',
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const ok = res.ok ? '✓' : '✗'
  const status = res.ok ? `status=${data.status}` : `erro="${data.error}"`
  console.log(`  ${ok} [${res.status}] ${label}: ${status}`)
  return { res, data, key, body }
}

async function inscreverDuplicado(inscricaoOriginal, sexo, label) {
  const key = gerarKey()
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify(inscricaoOriginal.body),
  })

  const data = await res.json()
  const esperado409 = res.status === 409
  const ok = esperado409 ? '✓' : '✗'
  console.log(`  ${ok} [${res.status}] ${label}: ${data.error ?? JSON.stringify(data)}`)
}

async function inscreverIdempotente(inscricaoOriginal, label) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': inscricaoOriginal.key,
    },
    body: JSON.stringify(inscricaoOriginal.body),
  })

  const data = await res.json()
  const ok = res.ok ? '✓' : '✗'
  console.log(`  ${ok} [${res.status}] ${label}: ${res.ok ? `id=${data.id}` : data.error}`)
}

async function main() {
  console.log('\n=== 5 inscrições masculinas ===')
  const resultsMasc = []
  for (const [i, p] of masculinos.entries()) {
    const r = await inscrever(p, 'Masculino', p.nomeCompleto)
    resultsMasc.push(r)
  }

  console.log('\n=== 5 inscrições femininas ===')
  const resultsFem = []
  for (const [i, p] of femininos.entries()) {
    const r = await inscrever(p, 'Feminino', p.nomeCompleto)
    resultsFem.push(r)
  }

  console.log('\n=== Duplicatas (mesmo nome + cartão, nova key) — esperado 409 ===')
  await inscreverDuplicado(resultsMasc[0], 'Masculino', `Duplicata: ${masculinos[0].nomeCompleto}`)
  await inscreverDuplicado(resultsFem[0], 'Feminino', `Duplicata: ${femininos[0].nomeCompleto}`)

  console.log('\n=== Idempotência (mesma key + mesmo payload) — esperado 200 repetido ===')
  await inscreverIdempotente(resultsMasc[1], `Idempotente: ${masculinos[1].nomeCompleto}`)
  await inscreverIdempotente(resultsFem[1], `Idempotente: ${femininos[1].nomeCompleto}`)

  console.log('\n=== Duplicata com nome em caixa diferente — esperado 409 ===')
  const comNomeMaiusculo = {
    ...resultsMasc[2],
    body: { ...resultsMasc[2].body, nomeCompleto: masculinos[2].nomeCompleto.toUpperCase() },
  }
  await inscreverDuplicado(comNomeMaiusculo, 'Masculino', `Case-insensitive: ${masculinos[2].nomeCompleto.toUpperCase()}`)

  console.log()
}

main().catch(console.error)
