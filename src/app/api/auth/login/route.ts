import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { empresa: true }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const senhaValida = await verifyPassword(senha, usuario.senhaHash)

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Criar token JWT
    const token = await createToken({
      userId: usuario.id,
      email: usuario.email,
      isAdmin: usuario.isAdmin,
      empresaId: usuario.empresaId
    })

    // Definir cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        isAdmin: usuario.isAdmin,
        empresa: {
          id: usuario.empresa.id,
          nome: usuario.empresa.nome
        }
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
