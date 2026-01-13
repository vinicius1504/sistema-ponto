import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.userId },
      include: { empresa: true }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        codigoFuncionario: usuario.codigoFuncionario,
        cargo: usuario.cargo,
        codigoCargo: usuario.codigoCargo,
        departamento: usuario.departamento,
        codigoDepartamento: usuario.codigoDepartamento,
        ctps: usuario.ctps,
        ctpsSerie: usuario.ctpsSerie,
        pis: usuario.pis,
        isAdmin: usuario.isAdmin,
        empresa: {
          id: usuario.empresa.id,
          nome: usuario.empresa.nome,
          cnpj: usuario.empresa.cnpj,
          endereco: usuario.empresa.endereco,
          atividade: usuario.empresa.atividade,
          servico: usuario.empresa.servico
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
