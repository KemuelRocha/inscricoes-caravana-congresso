import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { calcularIdade, validarMaioridade, validarWhatsapp } from '@/lib/validacoes'

const LIMITE_MASCULINO = 25
const LIMITE_FEMININO = 25

export async function POST(request: NextRequest) {
  try {
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

    const idade = calcularIdade(dataNascimento)
    const vagasRef = adminDb.collection('config').doc('vagas')

    const result = await adminDb.runTransaction(async (transaction) => {
      const vagasDoc = await transaction.get(vagasRef)

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

      transaction.set(inscricaoRef, {
        area: area.trim(),
        congregacao: congregacao.trim(),
        nomeCompleto: nomeCompleto.trim(),
        whatsapp: whatsapp.trim(),
        cartaoMembro: cartaoMembro.trim(),
        sexo,
        idade,
        dataNascimento,
        status,
        posicaoEspera,
        criadoEm: FieldValue.serverTimestamp(),
      })

      transaction.set(vagasRef, vagas, { merge: true })

      return { id: inscricaoRef.id, status, posicaoEspera, nome: nomeCompleto.trim(), sexo }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro na inscrição:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar inscrição. Tente novamente.' },
      { status: 500 }
    )
  }
}
