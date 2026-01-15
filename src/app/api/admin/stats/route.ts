import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await verifyAuth()

    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Estatisticas gerais
    const totalRegistros = await prisma.registroPonto.count()
    const totalUsuarios = await prisma.usuario.count()
    const totalEmpresas = await prisma.empresa.count()

    // Registros por periodo
    const umMesAtras = new Date()
    umMesAtras.setMonth(umMesAtras.getMonth() - 1)
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)
    const umAnoAtras = new Date()
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)

    const registrosUltimoMes = await prisma.registroPonto.count({
      where: { data: { gte: umMesAtras } }
    })
    const registrosUltimos3Meses = await prisma.registroPonto.count({
      where: { data: { gte: tresMesesAtras } }
    })
    const registrosMaisDeUmAno = await prisma.registroPonto.count({
      where: { data: { lt: umAnoAtras } }
    })

    return NextResponse.json({
      totais: {
        empresas: totalEmpresas,
        usuarios: totalUsuarios,
        registros: totalRegistros
      },
      registrosPorPeriodo: {
        ultimoMes: registrosUltimoMes,
        ultimos3Meses: registrosUltimos3Meses,
        maisDeUmAno: registrosMaisDeUmAno
      },
      limiteNeon: {
        armazenamento: '512 MB',
        dica: 'Registros com mais de 1 ano podem ser removidos para liberar espaco'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatisticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para limpar dados antigos
export async function DELETE() {
  try {
    const auth = await verifyAuth()

    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Deletar registros com mais de 1 ano
    const umAnoAtras = new Date()
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)

    const resultado = await prisma.registroPonto.deleteMany({
      where: {
        data: {
          lt: umAnoAtras
        }
      }
    })

    return NextResponse.json({
      success: true,
      registrosRemovidos: resultado.count,
      mensagem: `${resultado.count} registros com mais de 1 ano foram removidos`
    })
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
