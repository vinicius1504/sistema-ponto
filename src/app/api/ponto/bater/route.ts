import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentTime = new Date(`1970-01-01T${now.toTimeString().slice(0, 8)}`)

    // Buscar registro do dia
    let registro = await prisma.registroPonto.findUnique({
      where: {
        usuarioId_data: {
          usuarioId: session.userId,
          data: today
        }
      }
    })

    let tipoBatida: string
    let mensagem: string

    if (!registro) {
      // Criar registro com entrada
      registro = await prisma.registroPonto.create({
        data: {
          usuarioId: session.userId,
          data: today,
          entrada: currentTime
        }
      })
      tipoBatida = 'entrada'
      mensagem = 'Entrada registrada com sucesso!'
    } else if (!registro.saidaAlmoco) {
      // Registrar saída almoço
      registro = await prisma.registroPonto.update({
        where: { id: registro.id },
        data: { saidaAlmoco: currentTime }
      })
      tipoBatida = 'saidaAlmoco'
      mensagem = 'Saída para almoço registrada!'
    } else if (!registro.voltaAlmoco) {
      // Registrar volta almoço
      registro = await prisma.registroPonto.update({
        where: { id: registro.id },
        data: { voltaAlmoco: currentTime }
      })
      tipoBatida = 'voltaAlmoco'
      mensagem = 'Volta do almoço registrada!'
    } else if (!registro.saida) {
      // Registrar saída
      registro = await prisma.registroPonto.update({
        where: { id: registro.id },
        data: { saida: currentTime }
      })
      tipoBatida = 'saida'
      mensagem = 'Saída registrada! Bom descanso!'
    } else {
      return NextResponse.json(
        { error: 'Todas as batidas do dia já foram registradas' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tipoBatida,
      mensagem,
      registro,
      horario: now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  } catch (error) {
    console.error('Erro ao bater ponto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
