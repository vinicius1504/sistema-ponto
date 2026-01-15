import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    // Usuario pode ver seus proprios dados, admin pode ver qualquer um da empresa
    const isOwnProfile = session.userId === id
    const canView = isOwnProfile || session.isAdmin

    if (!canView) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const funcionario = await prisma.usuario.findFirst({
      where: {
        id,
        empresaId: session.empresaId
      },
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
        createdAt: true,
        empresaNomeCustom: true,
        empresaCnpjCustom: true,
        empresaEnderecoCustom: true,
        empresaAtividadeCustom: true,
        empresaServicoCustom: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            endereco: true,
            atividade: true,
            servico: true
          }
        }
      }
    })

    if (!funcionario) {
      return NextResponse.json({ error: 'Funcionario nao encontrado' }, { status: 404 })
    }

    return NextResponse.json({ funcionario })
  } catch (error) {
    console.error('Erro ao buscar funcionario:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    // Usuario pode editar seus proprios dados, admin pode editar qualquer um
    const isOwnProfile = session.userId === id
    const canEdit = isOwnProfile || session.isAdmin

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se o usuario pertence a mesma empresa
    const existingUser = await prisma.usuario.findFirst({
      where: {
        id,
        empresaId: session.empresaId
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Funcionario nao encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const {
      nome,
      email,
      senha,
      codigoFuncionario,
      cargo,
      codigoCargo,
      departamento,
      codigoDepartamento,
      ctps,
      ctpsSerie,
      pis,
      isAdmin,
      empresaNomeCustom,
      empresaCnpjCustom,
      empresaEnderecoCustom,
      empresaAtividadeCustom,
      empresaServicoCustom
    } = body

    // Se o email foi alterado, verificar se ja existe
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.usuario.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email ja cadastrado' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualizar
    const updateData: Record<string, unknown> = {}

    if (nome !== undefined) updateData.nome = nome
    if (email !== undefined) updateData.email = email
    if (codigoFuncionario !== undefined) updateData.codigoFuncionario = codigoFuncionario
    if (cargo !== undefined) updateData.cargo = cargo
    if (codigoCargo !== undefined) updateData.codigoCargo = codigoCargo
    if (departamento !== undefined) updateData.departamento = departamento
    if (codigoDepartamento !== undefined) updateData.codigoDepartamento = codigoDepartamento
    if (ctps !== undefined) updateData.ctps = ctps
    if (ctpsSerie !== undefined) updateData.ctpsSerie = ctpsSerie
    if (pis !== undefined) updateData.pis = pis

    // Campos customizaveis de empresa (string vazia = null para usar o padrao)
    if (empresaNomeCustom !== undefined) updateData.empresaNomeCustom = empresaNomeCustom || null
    if (empresaCnpjCustom !== undefined) updateData.empresaCnpjCustom = empresaCnpjCustom || null
    if (empresaEnderecoCustom !== undefined) updateData.empresaEnderecoCustom = empresaEnderecoCustom || null
    if (empresaAtividadeCustom !== undefined) updateData.empresaAtividadeCustom = empresaAtividadeCustom || null
    if (empresaServicoCustom !== undefined) updateData.empresaServicoCustom = empresaServicoCustom || null

    // Apenas admin pode alterar isAdmin
    if (session.isAdmin && isAdmin !== undefined) {
      updateData.isAdmin = isAdmin
    }

    // Se senha foi fornecida, fazer hash
    if (senha) {
      updateData.senhaHash = await hashPassword(senha)
    }

    const funcionario = await prisma.usuario.update({
      where: { id },
      data: updateData,
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
        createdAt: true,
        empresaNomeCustom: true,
        empresaCnpjCustom: true,
        empresaEnderecoCustom: true,
        empresaAtividadeCustom: true,
        empresaServicoCustom: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            endereco: true,
            atividade: true,
            servico: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      funcionario
    })
  } catch (error) {
    console.error('Erro ao atualizar funcionario:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Nao pode deletar a si mesmo
    if (session.userId === id) {
      return NextResponse.json(
        { error: 'Voce nao pode excluir sua propria conta' },
        { status: 400 }
      )
    }

    // Verificar se o usuario pertence a mesma empresa
    const existingUser = await prisma.usuario.findFirst({
      where: {
        id,
        empresaId: session.empresaId
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Funcionario nao encontrado' }, { status: 404 })
    }

    await prisma.usuario.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir funcionario:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
