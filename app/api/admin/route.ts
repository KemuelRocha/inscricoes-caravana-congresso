import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

interface InscricaoDoc {
  id: string
  area: string
  congregacao: string
  nomeCompleto: string
  whatsapp: string
  cartaoMembro: string
  sexo: string
  idade: number
  dataNascimento: string
  status: string
  posicaoEspera: number | null
  criadoEm: string | null
}

class AdminRouteError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
  }
}

function verificarSenha(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const senha = authHeader.replace('Bearer ', '')
  return senha === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!verificarSenha(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const exportCsv = searchParams.get('export') === 'csv'

    const [inscricoesSnap, vagasSnap] = await Promise.all([
      adminDb
        .collection('inscricoes')
        .where('status', 'in', ['confirmado', 'espera'])
        .get(),
      adminDb.collection('config').doc('vagas').get(),
    ])

    const inscricoes: InscricaoDoc[] = inscricoesSnap.docs
      .sort((a, b) => {
        const ta = a.data().criadoEm?.toMillis?.() ?? 0
        const tb = b.data().criadoEm?.toMillis?.() ?? 0
        return ta - tb
      })
      .map((doc) => {
        const data = doc.data()
        return {
        id: doc.id,
        area: data.area ?? '',
        congregacao: data.congregacao ?? '',
        nomeCompleto: data.nomeCompleto ?? '',
        whatsapp: data.whatsapp ?? '',
        cartaoMembro: data.cartaoMembro ?? '',
        sexo: data.sexo ?? '',
        idade: data.idade ?? 0,
        dataNascimento: data.dataNascimento ?? '',
        status: data.status ?? '',
        posicaoEspera: data.posicaoEspera ?? null,
        criadoEm: data.criadoEm?.toDate?.()?.toISOString() ?? null,
        }
      })

    if (exportCsv) {
      const cabecalho = [
        'ID',
        'Status',
        'Posição Espera',
        'Nome Completo',
        'Sexo',
        'Idade',
        'Data Nascimento',
        'WhatsApp',
        'Cartão Membro',
        'Área',
        'Congregação',
        'Criado Em',
      ]

      const linhas = inscricoes.map((i) => {
        const campos = [
          i.id,
          i.status,
          i.posicaoEspera ?? '',
          i.nomeCompleto,
          i.sexo,
          i.idade,
          i.dataNascimento,
          i.whatsapp,
          i.cartaoMembro,
          i.area,
          i.congregacao,
          i.criadoEm ?? '',
        ]
        return campos.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      })

      const csv = [cabecalho.join(','), ...linhas].join('\n')
      const bom = '﻿'

      return new NextResponse(bom + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscricoes-congresso-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    const vagas = vagasSnap.exists ? vagasSnap.data() : {}

    return NextResponse.json({ inscricoes, vagas })
  } catch (error) {
    console.error('Erro no admin GET:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!verificarSenha(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const inscricaoRef = adminDb.collection('inscricoes').doc(id)
    const vagasRef = adminDb.collection('config').doc('vagas')

    const result = await adminDb.runTransaction(async (transaction) => {
      const [inscricaoSnap, vagasSnap] = await Promise.all([
        transaction.get(inscricaoRef),
        transaction.get(vagasRef),
      ])

      if (!inscricaoSnap.exists) {
        throw new AdminRouteError('Inscrição não encontrada', 404)
      }

      const inscricao = inscricaoSnap.data()!
      const statusAtual = inscricao.status
      const sexo = inscricao.sexo

      if (statusAtual === 'cancelado') {
        return { promovido: null }
      }

      let proximo: FirebaseFirestore.QueryDocumentSnapshot | null = null
      if (statusAtual === 'confirmado') {
        const esperaSnap = await transaction.get(
          adminDb
            .collection('inscricoes')
            .where('sexo', '==', sexo)
            .where('status', '==', 'espera')
        )

        if (!esperaSnap.empty) {
          proximo = esperaSnap.docs.reduce((menor, doc) =>
            (doc.data().posicaoEspera ?? Infinity) < (menor.data().posicaoEspera ?? Infinity)
              ? doc
              : menor
          )
        }
      }

      const vagas = (vagasSnap.data() ?? {
        masculinoConfirmados: 0,
        femininoConfirmados: 0,
        masculinoEspera: 0,
        femininoEspera: 0,
      }) as Record<string, number>

      transaction.update(inscricaoRef, { status: 'cancelado' })

      if (statusAtual === 'confirmado') {
        if (proximo) {
          transaction.update(proximo.ref, { status: 'confirmado', posicaoEspera: null })
          const campoEspera = sexo === 'Masculino' ? 'masculinoEspera' : 'femininoEspera'
          transaction.update(vagasRef, {
            [campoEspera]: Math.max(0, (vagas[campoEspera] ?? 0) - 1),
          })
        } else {
          const campoConf = sexo === 'Masculino' ? 'masculinoConfirmados' : 'femininoConfirmados'
          transaction.update(vagasRef, {
            [campoConf]: Math.max(0, (vagas[campoConf] ?? 0) - 1),
          })
        }
      } else if (statusAtual === 'espera') {
        const campoEspera = sexo === 'Masculino' ? 'masculinoEspera' : 'femininoEspera'
        transaction.update(vagasRef, {
          [campoEspera]: Math.max(0, (vagas[campoEspera] ?? 0) - 1),
        })
      }

      return {
        promovido: proximo ? { nome: proximo.data().nomeCompleto } : null,
      }
    })

    return NextResponse.json({
      success: true,
      promovido: result.promovido,
    })
  } catch (error) {
    if (error instanceof AdminRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Erro no admin DELETE:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
