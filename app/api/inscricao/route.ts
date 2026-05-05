import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { calcularIdade, validarMaioridade, validarWhatsapp } from '@/lib/validacoes'
import { createHash } from 'crypto'

const LIMITE_MASCULINO = 25
const LIMITE_FEMININO = 25
const IDEMPOTENCY_KEY_REGEX = /^[A-Za-z0-9._:-]{8,128}$/

interface PayloadInscricao {
  area: string
  congregacao: string
  nomeCompleto: string
  whatsapp: string
  cartaoMembro: string
  sexo: 'Masculino' | 'Feminino'
  dataNascimento: string
}

interface RespostaInscricao {
  id: string
  status: 'confirmado' | 'espera'
  posicaoEspera: number | null
  nome: string
  sexo: 'Masculino' | 'Feminino'
}

function hashPayload(payload: PayloadInscricao): string {
  return createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get('Idempotency-Key')?.trim()
    if (!idempotencyKey || !IDEMPOTENCY_KEY_REGEX.test(idempotencyKey)) {
      return NextResponse.json(
        { error: 'Idempotency-Key inválida ou ausente' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { area, congregacao, nomeCompleto, whatsapp, cartaoMembro, sexo, dataNascimento } = body

    if (!area || !congregacao || !nomeCompleto || !whatsapp || !cartaoMembro || !sexo || !dataNascimento) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (sexo !== 'Masculino' && sexo !== 'Feminino') {
      return NextResponse.json({ error: 'Sexo inválido' }, { status: 400 })
    }

    if (!validarWhatsapp(whatsapp)) {
      return NextResponse.json({ error: 'Formato de WhatsApp inválido' }, { status: 400 })
    }

    if (!validarMaioridade(dataNascimento)) {
      const idade = calcularIdade(dataNascimento)
      return NextResponse.json(
        {
          error: `Você terá ${idade} anos em 03/07. É necessário ter 18 anos completos para se inscrever.`,
          menorDeIdade: true,
        },
        { status: 400 }
      )
    }

    const payload: PayloadInscricao = {
      area: String(area).trim(),
      congregacao: String(congregacao).trim(),
      nomeCompleto: String(nomeCompleto).trim(),
      whatsapp: String(whatsapp).trim(),
      cartaoMembro: String(cartaoMembro).trim(),
      sexo,
      dataNascimento: String(dataNascimento).trim(),
    }

    const idade = calcularIdade(dataNascimento)
    const vagasRef = adminDb.collection('config').doc('vagas')
    const idempotencyRef = adminDb.collection('idempotencyKeys').doc(idempotencyKey)
    const payloadHash = hashPayload(payload)

    const result = await adminDb.runTransaction(async (transaction) => {
      const [idempotencyDoc, vagasDoc] = await Promise.all([
        transaction.get(idempotencyRef),
        transaction.get(vagasRef),
      ])

      if (idempotencyDoc.exists) {
        const idempotencyData = idempotencyDoc.data()
        if (idempotencyData?.payloadHash !== payloadHash) {
          return { conflito: true as const }
        }

        return {
          conflito: false as const,
          response: idempotencyData.response as RespostaInscricao,
        }
      }

      const vagas = vagasDoc.exists
        ? (vagasDoc.data() as {
            masculinoConfirmados: number
            femininoConfirmados: number
            masculinoEspera: number
            femininoEspera: number
          })
        : {
            masculinoConfirmados: 0,
            femininoConfirmados: 0,
            masculinoEspera: 0,
            femininoEspera: 0,
          }

      let status: 'confirmado' | 'espera'
      let posicaoEspera: number | null = null

      if (sexo === 'Masculino') {
        if (vagas.masculinoConfirmados < LIMITE_MASCULINO) {
          status = 'confirmado'
          vagas.masculinoConfirmados++
        } else {
          status = 'espera'
          vagas.masculinoEspera++
          posicaoEspera = vagas.masculinoEspera
        }
      } else {
        if (vagas.femininoConfirmados < LIMITE_FEMININO) {
          status = 'confirmado'
          vagas.femininoConfirmados++
        } else {
          status = 'espera'
          vagas.femininoEspera++
          posicaoEspera = vagas.femininoEspera
        }
      }

      const inscricaoRef = adminDb.collection('inscricoes').doc()
      const response: RespostaInscricao = {
        id: inscricaoRef.id,
        status,
        posicaoEspera,
        nome: payload.nomeCompleto,
        sexo,
      }

      transaction.set(inscricaoRef, {
        area: payload.area,
        congregacao: payload.congregacao,
        nomeCompleto: payload.nomeCompleto,
        whatsapp: payload.whatsapp,
        cartaoMembro: payload.cartaoMembro,
        sexo,
        idade,
        dataNascimento: payload.dataNascimento,
        status,
        posicaoEspera,
        criadoEm: FieldValue.serverTimestamp(),
      })

      transaction.set(vagasRef, vagas, { merge: true })
      transaction.create(idempotencyRef, {
        payloadHash,
        response,
        inscricaoId: inscricaoRef.id,
        criadoEm: FieldValue.serverTimestamp(),
      })

      return { conflito: false as const, response }
    })

    if (result.conflito) {
      return NextResponse.json(
        { error: 'Esta chave de idempotência já foi usada com outros dados' },
        { status: 409 }
      )
    }

    return NextResponse.json(result.response)
  } catch (error) {
    console.error('Erro na inscrição:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar inscrição. Tente novamente.' },
      { status: 500 }
    )
  }
}
