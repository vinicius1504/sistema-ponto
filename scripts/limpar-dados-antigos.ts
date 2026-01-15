/**
 * Script para limpar dados antigos do banco de dados
 * Execute com: npx tsx scripts/limpar-dados-antigos.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limparDadosAntigos() {
  // Definir data limite (registros mais antigos que X meses serao deletados)
  const mesesParaManter = 12 // Manter ultimos 12 meses
  const dataLimite = new Date()
  dataLimite.setMonth(dataLimite.getMonth() - mesesParaManter)

  console.log('=== Limpeza de Dados Antigos ===')
  console.log(`Data limite: ${dataLimite.toLocaleDateString('pt-BR')}`)
  console.log(`Registros mais antigos que esta data serao removidos.\n`)

  try {
    // Contar registros que serao deletados
    const registrosAntigos = await prisma.registroPonto.count({
      where: {
        data: {
          lt: dataLimite
        }
      }
    })

    console.log(`Registros de ponto a serem removidos: ${registrosAntigos}`)

    if (registrosAntigos === 0) {
      console.log('\nNenhum registro antigo encontrado. Banco ja esta limpo!')
      return
    }

    // Confirmar antes de deletar
    console.log('\nDeletando registros antigos...')

    const resultado = await prisma.registroPonto.deleteMany({
      where: {
        data: {
          lt: dataLimite
        }
      }
    })

    console.log(`\n${resultado.count} registros de ponto removidos com sucesso!`)

    // Mostrar estatisticas atuais
    const totalRegistros = await prisma.registroPonto.count()
    const totalUsuarios = await prisma.usuario.count()
    const totalEmpresas = await prisma.empresa.count()

    console.log('\n=== Estatisticas Atuais ===')
    console.log(`Total de registros de ponto: ${totalRegistros}`)
    console.log(`Total de usuarios: ${totalUsuarios}`)
    console.log(`Total de empresas: ${totalEmpresas}`)

  } catch (error) {
    console.error('Erro ao limpar dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Funcao para ver estatisticas sem deletar
async function verEstatisticas() {
  console.log('=== Estatisticas do Banco ===\n')

  const totalRegistros = await prisma.registroPonto.count()
  const totalUsuarios = await prisma.usuario.count()
  const totalEmpresas = await prisma.empresa.count()

  // Registros por periodo
  const hoje = new Date()
  const umMesAtras = new Date()
  umMesAtras.setMonth(umMesAtras.getMonth() - 1)
  const tresMesesAtras = new Date()
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)
  const seisAtras = new Date()
  seisAtras.setMonth(seisAtras.getMonth() - 6)
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)

  const registrosUltimoMes = await prisma.registroPonto.count({
    where: { data: { gte: umMesAtras } }
  })
  const registrosUltimos3Meses = await prisma.registroPonto.count({
    where: { data: { gte: tresMesesAtras } }
  })
  const registrosUltimos6Meses = await prisma.registroPonto.count({
    where: { data: { gte: seisAtras } }
  })
  const registrosMaisDeUmAno = await prisma.registroPonto.count({
    where: { data: { lt: umAnoAtras } }
  })

  console.log('Totais:')
  console.log(`  Empresas: ${totalEmpresas}`)
  console.log(`  Usuarios: ${totalUsuarios}`)
  console.log(`  Registros de ponto: ${totalRegistros}`)

  console.log('\nRegistros por periodo:')
  console.log(`  Ultimo mes: ${registrosUltimoMes}`)
  console.log(`  Ultimos 3 meses: ${registrosUltimos3Meses}`)
  console.log(`  Ultimos 6 meses: ${registrosUltimos6Meses}`)
  console.log(`  Mais de 1 ano (podem ser removidos): ${registrosMaisDeUmAno}`)

  await prisma.$disconnect()
}

// Verificar argumento
const arg = process.argv[2]

if (arg === '--stats' || arg === '-s') {
  verEstatisticas()
} else if (arg === '--limpar' || arg === '-l') {
  limparDadosAntigos()
} else {
  console.log('Uso:')
  console.log('  npx tsx scripts/limpar-dados-antigos.ts --stats   # Ver estatisticas')
  console.log('  npx tsx scripts/limpar-dados-antigos.ts --limpar  # Limpar dados antigos')
}
