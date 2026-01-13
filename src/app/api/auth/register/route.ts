import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
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
      empresaNome,
      empresaCnpj,
      empresaEndereco,
      empresaAtividade,
      empresaServico
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

    // Verificar se empresa já existe pelo CNPJ
    let empresa = await prisma.empresa.findUnique({
      where: { cnpj: empresaCnpj }
    })

    // Se não existir, criar empresa
    if (!empresa) {
      empresa = await prisma.empresa.create({
        data: {
          nome: empresaNome,
          cnpj: empresaCnpj,
          endereco: empresaEndereco,
          atividade: empresaAtividade,
          servico: empresaServico || empresaNome
        }
      })
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha)

    // Criar usuário
    const usuario = await prisma.usuario.create({
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
        empresaId: empresa.id,
        isAdmin: true // Primeiro usuário da empresa é admin
      }
    })

    // Criar token JWT
    const token = await createToken({
      userId: usuario.id,
      email: usuario.email,
      isAdmin: usuario.isAdmin,
      empresaId: empresa.id
    })

    // Definir cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        isAdmin: usuario.isAdmin
      }
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
