import { db } from './firebase'
import { doc, onSnapshot, DocumentSnapshot } from 'firebase/firestore'

export const LIMITE_MASCULINO = 25
export const LIMITE_FEMININO = 25

export interface VagasData {
  masculinoConfirmados: number
  femininoConfirmados: number
  masculinoEspera: number
  femininoEspera: number
}

export interface InscricaoData {
  id: string
  area: string
  congregacao: string
  nomeCompleto: string
  whatsapp: string
  cartaoMembro: string
  sexo: 'Masculino' | 'Feminino'
  idade: number
  dataNascimento: string
  status: 'confirmado' | 'espera' | 'cancelado'
  posicaoEspera: number | null
  criadoEm: { seconds: number; nanoseconds: number } | null
}

export function ouvirVagas(callback: (vagas: VagasData) => void): () => void {
  const docRef = doc(db, 'config', 'vagas')
  return onSnapshot(docRef, (snap: DocumentSnapshot) => {
    if (snap.exists()) {
      callback(snap.data() as VagasData)
    } else {
      callback({
        masculinoConfirmados: 0,
        femininoConfirmados: 0,
        masculinoEspera: 0,
        femininoEspera: 0,
      })
    }
  })
}
