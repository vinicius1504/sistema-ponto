import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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
