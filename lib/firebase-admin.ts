import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let _app: App | null = null
let _db: Firestore | null = null

function getAdminApp(): App {
  if (_app) return _app
  if (getApps().length > 0) {
    _app = getApps()[0]
    return _app
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON não configurado')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)
  _app = initializeApp({ credential: cert(serviceAccount) })
  return _app
}

export function getAdminDb(): Firestore {
  if (_db) return _db
  getAdminApp()
  _db = getFirestore()
  return _db
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
