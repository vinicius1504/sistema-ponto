import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Criar empresa Miliontech
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      nome: 'Miliontech',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua Exemplo, 123 - Centro - São Paulo/SP',
      atividade: 'Tecnologia da Informação',
      servico: 'Desenvolvimento de Software',
    },
  })

  console.log('Empresa criada:', empresa.nome)

  // Criar usuário admin
  const senhaHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@miliontech.com.br' },
    update: {},
    create: {
      empresaId: empresa.id,
      email: 'admin@miliontech.com.br',
      senhaHash,
      nome: 'Administrador',
      codigoFuncionario: '001',
      cargo: 'Administrador',
      codigoCargo: 'ADM',
      departamento: 'Administrativo',
      codigoDepartamento: 'ADM',
      ctps: '123456',
      ctpsSerie: '001',
      pis: '123.45678.90-1',
      isAdmin: true,
    },
  })

  console.log('Admin criado:', admin.email)

  // Criar funcionário exemplo
  const funcionarioSenha = await bcrypt.hash('func123', 10)

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'funcionario@miliontech.com.br' },
    update: {},
    create: {
      empresaId: empresa.id,
      email: 'funcionario@miliontech.com.br',
      senhaHash: funcionarioSenha,
      nome: 'João Silva',
      codigoFuncionario: '002',
      cargo: 'Desenvolvedor',
      codigoCargo: 'DEV',
      departamento: 'Tecnologia',
      codigoDepartamento: 'TI',
      ctps: '654321',
      ctpsSerie: '002',
      pis: '987.65432.10-1',
      isAdmin: false,
    },
  })

  console.log('Funcionário criado:', funcionario.email)

  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
