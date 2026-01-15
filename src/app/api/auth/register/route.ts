import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Suporta tanto o formato antigo quanto o novo formato { empresa, usuario }
    let email, senha, nome, codigoFuncionario, cargo, codigoCargo
    let departamento, codigoDepartamento, ctps, ctpsSerie, pis
    let empresaNome, empresaCnpj, empresaEndereco, empresaAtividade, empresaServico

    if (body.empresa && body.usuario) {
      // Novo formato: { empresa: {...}, usuario: {...} }
      email = body.usuario.email
      senha = body.usuario.senha
      nome = body.usuario.nome
      codigoFuncionario = body.usuario.codigoFuncionario || '001'
      cargo = body.usuario.cargo || 'Funcionário'
      codigoCargo = body.usuario.codigoCargo || '001'
      departamento = body.usuario.departamento || 'Geral'
      codigoDepartamento = body.usuario.codigoDepartamento || '001'
      ctps = body.usuario.ctps || '0000000'
      ctpsSerie = body.usuario.ctpsSerie || '0000'
      pis = body.usuario.pis || '00000000000'
      empresaNome = body.empresa.nome
      empresaCnpj = body.empresa.cnpj
      empresaEndereco = body.empresa.endereco || 'Não informado'
      empresaAtividade = body.empresa.atividade || 'Não informado'
      empresaServico = body.empresa.servico
    } else {
      // Formato antigo: campos diretos
      email = body.email
      senha = body.senha
      nome = body.nome
      codigoFuncionario = body.codigoFuncionario
      cargo = body.cargo
      codigoCargo = body.codigoCargo
      departamento = body.departamento
      codigoDepartamento = body.codigoDepartamento
      ctps = body.ctps
      ctpsSerie = body.ctpsSerie
      pis = body.pis
      empresaNome = body.empresaNome
      empresaCnpj = body.empresaCnpj
      empresaEndereco = body.empresaEndereco
      empresaAtividade = body.empresaAtividade
      empresaServico = body.empresaServico
    }

    // Validar campos obrigatórios
    if (!email || !senha || !nome || !empresaCnpj) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, senha, nome e CNPJ da empresa' },
        { status: 400 }
      )
    }

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

    // Criar usuário com os dados da empresa vinculados (campos custom)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usuarioData: any = {
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
      isAdmin: false // Usuario cadastrado como funcionario, nao admin
    }

    // Salvar os dados da empresa do cadastro como dados custom do usuario
    if (empresaNome) usuarioData.empresaNomeCustom = empresaNome
    if (empresaCnpj) usuarioData.empresaCnpjCustom = empresaCnpj
    if (empresaEndereco) usuarioData.empresaEnderecoCustom = empresaEndereco
    if (empresaAtividade) usuarioData.empresaAtividadeCustom = empresaAtividade
    if (empresaServico) usuarioData.empresaServicoCustom = empresaServico

    const usuario = await prisma.usuario.create({
      data: usuarioData
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
