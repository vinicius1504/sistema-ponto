import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface EditPontoData {
  entrada?: string | null
  saidaAlmoco?: string | null
  voltaAlmoco?: string | null
  saida?: string | null
}

function parseTimeString(timeStr: string | null | undefined): Date | null {
  if (!timeStr) return null
  // Aceita formato HH:MM ou HH:MM:SS
  const match = timeStr.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null
  return new Date(`1970-01-01T${timeStr.padEnd(8, ':00')}`)
}

function validateTimeSequence(times: EditPontoData): { valid: boolean; error?: string } {
  const timeValues: { name: string; value: Date | null }[] = [
    { name: 'entrada', value: parseTimeString(times.entrada) },
    { name: 'saidaAlmoco', value: parseTimeString(times.saidaAlmoco) },
    { name: 'voltaAlmoco', value: parseTimeString(times.voltaAlmoco) },
    { name: 'saida', value: parseTimeString(times.saida) }
  ]

  const filledTimes = timeValues.filter(t => t.value !== null)

  for (let i = 0; i < filledTimes.length - 1; i++) {
    const current = filledTimes[i]
    const next = filledTimes[i + 1]
    if (current.value && next.value && current.value >= next.value) {
      return {
        valid: false,
        error: `${current.name} deve ser antes de ${next.name}`
      }
    }
  }

  return { valid: true }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    const registro = await prisma.registroPonto.findUnique({
      where: {
        usuarioId_data: {
          usuarioId: session.userId,
          data: new Date(data)
        }
      }
    })

    return NextResponse.json({ registro })
  } catch (error) {
    console.error('Erro ao buscar ponto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')
    const usuarioIdParam = searchParams.get('usuarioId')

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar permissao - admin pode editar qualquer usuario
    const user = await prisma.usuario.findUnique({
      where: { id: session.userId }
    })

    let targetUserId = session.userId

    if (usuarioIdParam) {
      if (!user?.isAdmin) {
        return NextResponse.json(
          { error: 'Sem permissao para editar registros de outros usuarios' },
          { status: 403 }
        )
      }
      targetUserId = usuarioIdParam
    }

    const body: EditPontoData = await request.json()

    // Validar sequência de horários
    const validation = validateTimeSequence(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Buscar registro existente
    const existingRegistro = await prisma.registroPonto.findUnique({
      where: {
        usuarioId_data: {
          usuarioId: targetUserId,
          data: new Date(data)
        }
      }
    })

    // Preparar dados para atualização
    const updateData: {
      entrada?: Date | null
      saidaAlmoco?: Date | null
      voltaAlmoco?: Date | null
      saida?: Date | null
    } = {}

    if (body.entrada !== undefined) {
      updateData.entrada = parseTimeString(body.entrada)
    }
    if (body.saidaAlmoco !== undefined) {
      updateData.saidaAlmoco = parseTimeString(body.saidaAlmoco)
    }
    if (body.voltaAlmoco !== undefined) {
      updateData.voltaAlmoco = parseTimeString(body.voltaAlmoco)
    }
    if (body.saida !== undefined) {
      updateData.saida = parseTimeString(body.saida)
    }

    let registro

    if (existingRegistro) {
      // Atualizar registro existente
      registro = await prisma.registroPonto.update({
        where: { id: existingRegistro.id },
        data: updateData
      })
    } else {
      // Criar novo registro
      registro = await prisma.registroPonto.create({
        data: {
          usuarioId: targetUserId,
          data: new Date(data),
          ...updateData
        }
      })
    }

    return NextResponse.json({
      success: true,
      registro,
      mensagem: 'Registro atualizado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao editar ponto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
