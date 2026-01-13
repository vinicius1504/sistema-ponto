import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const funcionarios = await prisma.usuario.findMany({
      where: { empresaId: session.empresaId },
      select: {
        id: true,
        nome: true,
        email: true,
        codigoFuncionario: true,
        cargo: true,
        codigoCargo: true,
        departamento: true,
        codigoDepartamento: true,
        ctps: true,
        ctpsSerie: true,
        pis: true,
        isAdmin: true,
        createdAt: true
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json({ funcionarios })
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const {
      email,
      senha,
      nome,
      codigoFuncionario,
      cargo,
      codigoCargo,
      departamento,
      codigoDepartamento,
      ctps,
      ctpsSerie,
      pis,
      isAdmin = false
    } = body

    // Verificar se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const senhaHash = await hashPassword(senha)

    const funcionario = await prisma.usuario.create({
      data: {
        email,
        senhaHash,
        nome,
        codigoFuncionario,
        cargo,
        codigoCargo,
        departamento,
        codigoDepartamento,
        ctps,
        ctpsSerie,
        pis,
        isAdmin,
        empresaId: session.empresaId
      }
    })

    return NextResponse.json({
      success: true,
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
        email: funcionario.email
      }
    })
  } catch (error) {
    console.error('Erro ao criar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
