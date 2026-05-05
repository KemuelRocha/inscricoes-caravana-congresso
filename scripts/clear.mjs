import { readFileSync } from 'fs'
import { resolve } from 'path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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

async function clear() {
  console.log('🗑️  Limpando banco de dados...\n')

  // Deleta todas as inscrições em lotes de 500
  let total = 0
  let snap = await db.collection('inscricoes').limit(500).get()
  while (!snap.empty) {
    const batch = db.batch()
    snap.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    total += snap.docs.length
    console.log(`   Deletados: ${total}`)
    snap = await db.collection('inscricoes').limit(500).get()
  }

  // Zera o contador
  await db.collection('config').doc('vagas').set({
    masculinoConfirmados: 0,
    femininoConfirmados: 0,
    masculinoEspera: 0,
    femininoEspera: 0,
  })

  console.log(`\n✅ ${total} inscrições deletadas`)
  console.log('✅ Contador zerado')
}

clear().catch((err) => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
