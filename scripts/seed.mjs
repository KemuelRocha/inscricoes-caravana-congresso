import { readFileSync } from 'fs'
import { resolve } from 'path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Carrega .env.local manualmente
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  let val = trimmed.slice(idx + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[key] = val
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const AREAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const CONGREGACOES_M = ['MATRIZ', 'VILA EDUARDO', 'COHAB IV', 'JOSÉ E MARIA I', 'JARDIM AMAZONAS I']
const CONGREGACOES_F = ['NOVA DESCOBERTA I', 'LAGOA GRANDE I', 'VILA 12', 'RAJADA', 'CAITITU']
const NOMES_M = [
  'João Pedro Silva', 'Carlos Eduardo Santos', 'Felipe Oliveira', 'Lucas Mendes', 'Rafael Costa',
  'Bruno Ferreira', 'Thiago Souza', 'Mateus Rodrigues', 'Henrique Lima', 'Gabriel Alves',
  'Pedro Nunes', 'André Barbosa', 'Diego Carvalho', 'Leandro Martins', 'Rodrigo Pereira',
  'Alexandre Gomes', 'Fabrício Dias', 'Renato Araújo', 'Samuel Nascimento', 'Vitor Hugo Castro',
  'Igor Lopes', 'Marcos Vinícius', 'Leonardo Freitas', 'Eduardo Ribeiro', 'Gustavo Pinto',
  'Daniel Cardoso', 'Paulo Henrique',
]
const NOMES_F = [
  'Ana Clara Souza', 'Beatriz Oliveira', 'Camila Santos', 'Daniela Lima', 'Eduarda Ferreira',
  'Fernanda Costa', 'Gabriela Mendes', 'Helena Rodrigues', 'Isabella Alves', 'Juliana Pereira',
  'Karina Nunes', 'Larissa Barbosa', 'Mariana Carvalho', 'Natália Martins', 'Olivia Gomes',
  'Patrícia Dias', 'Rafaela Araújo', 'Sabrina Nascimento', 'Tâmara Castro', 'Ursula Lopes',
  'Vanessa Freitas', 'Wanessa Ribeiro', 'Yasmin Pinto', 'Zélia Cardoso', 'Aline Henrique',
  'Brenda Farias', 'Cecília Monteiro',
]

function gerarWhatsapp(i) {
  return `(81) 9${String(9000 + i).padStart(4, '0')}-${String(1000 + i).padStart(4, '0')}`
}

function gerarData(i, genero) {
  // Idades entre 18 e 35 anos até 03/07/2026
  const baseAno = 2026 - 18 - (i % 15)
  const mes = String((i % 12) + 1).padStart(2, '0')
  const dia = String((i % 28) + 1).padStart(2, '0')
  return `${baseAno}-${mes}-${dia}`
}

function calcularIdade(dataNascimento) {
  const nasc = new Date(dataNascimento + 'T00:00:00')
  const corte = new Date(2026, 6, 3) // 3 de julho de 2026
  let idade = corte.getFullYear() - nasc.getFullYear()
  const diff = corte.getMonth() - nasc.getMonth()
  if (diff < 0 || (diff === 0 && corte.getDate() < nasc.getDate())) idade--
  return idade
}

async function seed() {
  console.log('🌱 Iniciando seed...\n')

  const batch1 = db.batch()
  const batch2 = db.batch()

  let masculinoConfirmados = 0
  let femininoConfirmados = 0
  let masculinoEspera = 0
  let femininoEspera = 0

  // 25 Masculino confirmados
  console.log('👨 Inserindo 25 masculinos confirmados...')
  for (let i = 0; i < 25; i++) {
    const ref = db.collection('inscricoes').doc()
    const data = gerarData(i, 'M')
    batch1.set(ref, {
      area: String(AREAS[i % AREAS.length]),
      congregacao: CONGREGACOES_M[i % CONGREGACOES_M.length],
      nomeCompleto: NOMES_M[i],
      whatsapp: gerarWhatsapp(i),
      cartaoMembro: `MC${String(1000 + i)}`,
      sexo: 'Masculino',
      dataNascimento: data,
      idade: calcularIdade(data),
      status: 'confirmado',
      posicaoEspera: null,
      criadoEm: FieldValue.serverTimestamp(),
    })
    masculinoConfirmados++
  }

  // 25 Feminino confirmadas
  console.log('👩 Inserindo 25 femininos confirmadas...')
  for (let i = 0; i < 25; i++) {
    const ref = db.collection('inscricoes').doc()
    const data = gerarData(i, 'F')
    batch1.set(ref, {
      area: String(AREAS[i % AREAS.length]),
      congregacao: CONGREGACOES_F[i % CONGREGACOES_F.length],
      nomeCompleto: NOMES_F[i],
      whatsapp: gerarWhatsapp(100 + i),
      cartaoMembro: `FC${String(2000 + i)}`,
      sexo: 'Feminino',
      dataNascimento: data,
      idade: calcularIdade(data),
      status: 'confirmado',
      posicaoEspera: null,
      criadoEm: FieldValue.serverTimestamp(),
    })
    femininoConfirmados++
  }

  await batch1.commit()
  console.log('✅ 50 confirmados inseridos\n')

  // 2 Masculino na espera
  console.log('⏳ Inserindo 2 masculinos em espera...')
  for (let i = 25; i < 27; i++) {
    const ref = db.collection('inscricoes').doc()
    const data = gerarData(i, 'M')
    masculinoEspera++
    batch2.set(ref, {
      area: String(AREAS[i % AREAS.length]),
      congregacao: CONGREGACOES_M[i % CONGREGACOES_M.length],
      nomeCompleto: NOMES_M[i],
      whatsapp: gerarWhatsapp(200 + i),
      cartaoMembro: `MC${String(3000 + i)}`,
      sexo: 'Masculino',
      dataNascimento: data,
      idade: calcularIdade(data),
      status: 'espera',
      posicaoEspera: masculinoEspera,
      criadoEm: FieldValue.serverTimestamp(),
    })
  }

  // 2 Feminino na espera
  console.log('⏳ Inserindo 2 femininos em espera...')
  for (let i = 25; i < 27; i++) {
    const ref = db.collection('inscricoes').doc()
    const data = gerarData(i, 'F')
    femininoEspera++
    batch2.set(ref, {
      area: String(AREAS[i % AREAS.length]),
      congregacao: CONGREGACOES_F[i % CONGREGACOES_F.length],
      nomeCompleto: NOMES_F[i],
      whatsapp: gerarWhatsapp(300 + i),
      cartaoMembro: `FC${String(4000 + i)}`,
      sexo: 'Feminino',
      dataNascimento: data,
      idade: calcularIdade(data),
      status: 'espera',
      posicaoEspera: femininoEspera,
      criadoEm: FieldValue.serverTimestamp(),
    })
  }

  // Atualiza o contador
  const vagasRef = db.collection('config').doc('vagas')
  batch2.set(vagasRef, {
    masculinoConfirmados,
    femininoConfirmados,
    masculinoEspera,
    femininoEspera,
  })

  await batch2.commit()

  console.log('\n🎉 Seed concluído!')
  console.log(`   ✅ ${masculinoConfirmados} masculinos confirmados`)
  console.log(`   ✅ ${femininoConfirmados} femininas confirmadas`)
  console.log(`   ⏳ ${masculinoEspera} masculinos em espera`)
  console.log(`   ⏳ ${femininoEspera} femininas em espera`)
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
