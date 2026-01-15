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
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const usuarioId = searchParams.get('usuarioId') || session.userId

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { error: 'Data início e fim são obrigatórias' },
        { status: 400 }
      )
    }

    // Se não for admin, só pode ver seus próprios registros
    if (!session.isAdmin && usuarioId !== session.userId) {
      return NextResponse.json(
        { error: 'Sem permissão' },
        { status: 403 }
      )
    }

    const registros = await prisma.registroPonto.findMany({
      where: {
        usuarioId,
        data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      },
      orderBy: { data: 'asc' }
    })

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { empresa: true }
    })

    return NextResponse.json({
      registros,
      usuario: {
        id: usuario?.id,
        nome: usuario?.nome,
        codigoFuncionario: usuario?.codigoFuncionario,
        cargo: usuario?.cargo,
        codigoCargo: usuario?.codigoCargo,
        departamento: usuario?.departamento,
        codigoDepartamento: usuario?.codigoDepartamento,
        ctps: usuario?.ctps,
        ctpsSerie: usuario?.ctpsSerie,
        pis: usuario?.pis,
        empresaNomeCustom: usuario?.empresaNomeCustom,
        empresaCnpjCustom: usuario?.empresaCnpjCustom,
        empresaEnderecoCustom: usuario?.empresaEnderecoCustom,
        empresaAtividadeCustom: usuario?.empresaAtividadeCustom,
        empresaServicoCustom: usuario?.empresaServicoCustom,
        empresa: usuario?.empresa
      }
    })
  } catch (error) {
    console.error('Erro ao buscar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
