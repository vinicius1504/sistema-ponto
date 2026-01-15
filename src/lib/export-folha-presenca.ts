import ExcelJS from 'exceljs'
import { getDayOfWeek, minutesToHoursString } from './utils'

interface Registro {
  data: string
  entrada: string | null
  saidaAlmoco: string | null
  voltaAlmoco: string | null
  saida: string | null
  horasExtras: number
}

interface Usuario {
  nome: string
  codigoFuncionario: string
  cargo: string
  codigoCargo: string
  departamento: string
  codigoDepartamento: string
  ctps: string
  ctpsSerie: string
  pis: string
  // Campos customizaveis de empresa
  empresaNomeCustom?: string | null
  empresaCnpjCustom?: string | null
  empresaEnderecoCustom?: string | null
  empresaAtividadeCustom?: string | null
  empresaServicoCustom?: string | null
  empresa: {
    nome: string
    cnpj: string
    endereco: string
    atividade: string
    servico: string | null
  }
}

const formatTimeFromString = (timeStr: string | null): string => {
  if (!timeStr) return ''
  try {
    // Extrair apenas HH:MM da string ISO sem conversão de fuso horário
    const match = timeStr.match(/T(\d{2}:\d{2})/)
    if (match) return match[1]

    // Fallback para strings que já são apenas hora
    if (/^\d{2}:\d{2}/.test(timeStr)) return timeStr.slice(0, 5)

    return ''
  } catch {
    return ''
  }
}

const generateDays = (dataInicio: Date, dataFim: Date): Date[] => {
  const days: Date[] = []
  const current = new Date(dataInicio)
  while (current <= dataFim) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

const getRegistroForDate = (registros: Registro[], date: Date): Registro | undefined => {
  const dateStr = date.toISOString().split('T')[0]
  return registros.find((r) => r.data.startsWith(dateStr))
}

const calculateTotalHours = (registros: Registro[]): number => {
  let total = 0
  registros.forEach((r) => {
    if (r.entrada && r.saida) {
      const entrada = new Date(r.entrada)
      const saida = new Date(r.saida)
      let minutes = (saida.getTime() - entrada.getTime()) / (1000 * 60)

      if (r.saidaAlmoco && r.voltaAlmoco) {
        const saidaAlmoco = new Date(r.saidaAlmoco)
        const voltaAlmoco = new Date(r.voltaAlmoco)
        const intervalo = (voltaAlmoco.getTime() - saidaAlmoco.getTime()) / (1000 * 60)
        minutes -= intervalo
      }

      total += minutes
    }
  })
  return total
}

const calculateTotalExtras = (registros: Registro[]): number => {
  return registros.reduce((acc, r) => acc + (r.horasExtras || 0), 0)
}

export async function exportFolhaPresenca(
  usuario: Usuario,
  registros: Registro[],
  dataInicio: Date,
  dataFim: Date
): Promise<Blob> {
  // Usa dados customizados do usuario ou fallback para dados da empresa
  const empresaNome = usuario.empresaNomeCustom || usuario.empresa.nome
  const empresaCnpj = usuario.empresaCnpjCustom || usuario.empresa.cnpj
  const empresaEndereco = usuario.empresaEnderecoCustom || usuario.empresa.endereco
  const empresaAtividade = usuario.empresaAtividadeCustom || usuario.empresa.atividade
  const empresaServico = usuario.empresaServicoCustom || usuario.empresa.servico || empresaNome

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Folha de Presenca', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.3,
        bottom: 0.3,
        header: 0.1,
        footer: 0.1
      }
    }
  })

  // Configurar largura das colunas (agora com 8 colunas para dividir intervalo)
  sheet.columns = [
    { width: 5 },   // A - Dia
    { width: 5 },   // B - Dia semana
    { width: 10 },  // C - Inicio
    { width: 8 },   // D - Intervalo Saida
    { width: 8 },   // E - Intervalo Volta
    { width: 10 },  // F - Termino
    { width: 8 },   // G - Extra
    { width: 20 },  // H - Assinatura
  ]

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }

  const borderOutline: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }

  const noBorderInner: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: undefined },
    right: { style: undefined }
  }

  const boldFont: Partial<ExcelJS.Font> = { bold: true, size: 10 }
  const boldFontWhite: Partial<ExcelJS.Font> = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
  const normalFont: Partial<ExcelJS.Font> = { size: 10 }

  // Fundo cinza escuro para titulos
  const darkGrayFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A4A4A' }
  }

  let row = 1

  // === CABECALHO PRINCIPAL - TITULO ===
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = 'FOLHA INDIVIDUAL DE PRESENCA'
  sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  sheet.getCell(`A${row}`).fill = darkGrayFill
  sheet.getCell(`A${row}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' } }
  sheet.getCell(`D${row}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  const periodo = `Periodo: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`
  sheet.getCell(`E${row}`).value = periodo
  sheet.getCell(`E${row}`).font = boldFontWhite
  sheet.getCell(`E${row}`).fill = darkGrayFill
  sheet.getCell(`E${row}`).alignment = { horizontal: 'right' }
  sheet.getCell(`E${row}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' } }
  sheet.getCell(`H${row}`).border = { top: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
  row++

  // === DADOS DA EMPRESA E FUNCIONARIO (sem bordas internas) ===
  // Linha: Empresa e CNPJ
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = `EMPRESA: ${empresaNome.toUpperCase()}`
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).border = { left: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  sheet.getCell(`E${row}`).value = `CNPJ/CPF: ${empresaCnpj.toUpperCase()}`
  sheet.getCell(`E${row}`).font = boldFont
  sheet.getCell(`H${row}`).border = { right: { style: 'thin' } }
  row++

  // Linha: Servico
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = `SERVICO: ${empresaServico.toUpperCase()}`
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).border = { left: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  sheet.getCell(`E${row}`).value = ''
  sheet.getCell(`H${row}`).border = { right: { style: 'thin' } }
  row++

  // Linha: Atividade
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = `ATIVIDADE: ${empresaAtividade.toUpperCase()}`
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).border = { left: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  sheet.getCell(`E${row}`).value = ''
  sheet.getCell(`H${row}`).border = { right: { style: 'thin' } }
  row++

  // Linha: Endereco e CTPS
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = `ENDERECO: ${empresaEndereco.toUpperCase()}`
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).border = { left: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  sheet.getCell(`E${row}`).value = `CTPS/SERIE: ${usuario.ctps.toUpperCase()}/${usuario.ctpsSerie.toUpperCase()}`
  sheet.getCell(`E${row}`).font = boldFont
  sheet.getCell(`H${row}`).border = { right: { style: 'thin' } }
  row++

  // Linha: Funcionario e Depto
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = `FUNCIONARIO: ${usuario.codigoFuncionario.toUpperCase()} - ${usuario.nome.toUpperCase()}`
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).border = { left: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  sheet.getCell(`E${row}`).value = `DEPTO: ${usuario.codigoDepartamento.toUpperCase()} - ${usuario.departamento.toUpperCase()}`
  sheet.getCell(`E${row}`).font = boldFont
  sheet.getCell(`H${row}`).border = { right: { style: 'thin' } }
  row++

  // Linha: Cargo e PIS
  sheet.mergeCells(`A${row}:D${row}`)
  sheet.getCell(`A${row}`).value = `CARGO: ${usuario.codigoCargo.toUpperCase()} - ${usuario.cargo.toUpperCase()}`
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).border = { left: { style: 'thin' }, bottom: { style: 'thin' } }
  sheet.getCell(`B${row}`).border = { bottom: { style: 'thin' } }
  sheet.getCell(`C${row}`).border = { bottom: { style: 'thin' } }
  sheet.getCell(`D${row}`).border = { bottom: { style: 'thin' } }

  sheet.mergeCells(`E${row}:H${row}`)
  sheet.getCell(`E${row}`).value = `PIS: ${usuario.pis.toUpperCase()}`
  sheet.getCell(`E${row}`).font = boldFont
  sheet.getCell(`E${row}`).border = { bottom: { style: 'thin' } }
  sheet.getCell(`F${row}`).border = { bottom: { style: 'thin' } }
  sheet.getCell(`G${row}`).border = { bottom: { style: 'thin' } }
  sheet.getCell(`H${row}`).border = { right: { style: 'thin' }, bottom: { style: 'thin' } }
  row++

  // Linha vazia
  row++

  // === CABECALHO DA TABELA COM FUNDO CINZA ===
  // Linha com "Dias", "Normal", "Extra", "Assinatura"
  sheet.mergeCells(`A${row}:B${row}`)
  sheet.getCell(`A${row}`).value = 'Dias'
  sheet.getCell(`A${row}`).font = boldFontWhite
  sheet.getCell(`A${row}`).fill = darkGrayFill
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getCell(`A${row}`).border = borderThin

  sheet.mergeCells(`C${row}:F${row}`)
  sheet.getCell(`C${row}`).value = 'Normal'
  sheet.getCell(`C${row}`).font = boldFontWhite
  sheet.getCell(`C${row}`).fill = darkGrayFill
  sheet.getCell(`C${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getCell(`C${row}`).border = borderThin

  sheet.getCell(`G${row}`).value = 'Extra'
  sheet.getCell(`G${row}`).font = boldFontWhite
  sheet.getCell(`G${row}`).fill = darkGrayFill
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getCell(`G${row}`).border = borderThin

  sheet.getCell(`H${row}`).value = 'Assinatura'
  sheet.getCell(`H${row}`).font = boldFontWhite
  sheet.getCell(`H${row}`).fill = darkGrayFill
  sheet.getCell(`H${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getCell(`H${row}`).border = borderThin
  row++

  // Linha com subcolunas - Inicio, Intervalo (dividido), Termino
  sheet.getCell(`A${row}`).value = ''
  sheet.getCell(`A${row}`).border = borderThin
  sheet.getCell(`B${row}`).value = ''
  sheet.getCell(`B${row}`).border = borderThin

  sheet.getCell(`C${row}`).value = 'Inicio'
  sheet.getCell(`C${row}`).font = boldFont
  sheet.getCell(`C${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`C${row}`).border = borderThin

  // Intervalo - titulo mesclado, dados separados
  sheet.mergeCells(`D${row}:E${row}`)
  sheet.getCell(`D${row}`).value = 'Intervalo'
  sheet.getCell(`D${row}`).font = boldFont
  sheet.getCell(`D${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`D${row}`).border = borderThin

  sheet.getCell(`F${row}`).value = 'Termino'
  sheet.getCell(`F${row}`).font = boldFont
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`F${row}`).border = borderThin

  sheet.getCell(`G${row}`).value = ''
  sheet.getCell(`G${row}`).border = borderThin

  sheet.getCell(`H${row}`).value = ''
  sheet.getCell(`H${row}`).border = borderThin
  row++

  // === DADOS DOS DIAS ===
  const days = generateDays(dataInicio, dataFim)

  days.forEach((day) => {
    const registro = getRegistroForDate(registros, day)

    sheet.getCell(`A${row}`).value = day.getDate().toString().padStart(2, '0')
    sheet.getCell(`A${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`A${row}`).border = borderThin
    sheet.getCell(`A${row}`).font = normalFont

    sheet.getCell(`B${row}`).value = getDayOfWeek(day)
    sheet.getCell(`B${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`B${row}`).border = borderThin
    sheet.getCell(`B${row}`).font = normalFont

    sheet.getCell(`C${row}`).value = formatTimeFromString(registro?.entrada || null)
    sheet.getCell(`C${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`C${row}`).border = borderThin
    sheet.getCell(`C${row}`).font = normalFont

    // Intervalo - Saida Almoco (com linha divisoria)
    sheet.getCell(`D${row}`).value = formatTimeFromString(registro?.saidaAlmoco || null)
    sheet.getCell(`D${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`D${row}`).border = borderThin
    sheet.getCell(`D${row}`).font = normalFont

    // Intervalo - Volta Almoco (com linha divisoria)
    sheet.getCell(`E${row}`).value = formatTimeFromString(registro?.voltaAlmoco || null)
    sheet.getCell(`E${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`E${row}`).border = borderThin
    sheet.getCell(`E${row}`).font = normalFont

    sheet.getCell(`F${row}`).value = formatTimeFromString(registro?.saida || null)
    sheet.getCell(`F${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`F${row}`).border = borderThin
    sheet.getCell(`F${row}`).font = normalFont

    sheet.getCell(`G${row}`).value = registro?.horasExtras ? minutesToHoursString(registro.horasExtras) : ''
    sheet.getCell(`G${row}`).alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getCell(`G${row}`).border = borderThin
    sheet.getCell(`G${row}`).font = normalFont

    sheet.getCell(`H${row}`).value = ''
    sheet.getCell(`H${row}`).border = borderThin

    row++
  })

  // === TOTALIZADORES ===
  const totalHoras = calculateTotalHours(registros)
  const totalExtras = calculateTotalExtras(registros)

  // Linha 1: Tot. Horas Trabalhadas e Tot. Horas Extras
  sheet.mergeCells(`A${row}:C${row}`)
  sheet.getCell(`A${row}`).value = 'Tot. Horas Trabalhadas'
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`A${row}`).border = borderThin

  sheet.mergeCells(`D${row}:E${row}`)
  sheet.getCell(`D${row}`).value = minutesToHoursString(totalHoras)
  sheet.getCell(`D${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`D${row}`).border = borderThin
  sheet.getCell(`D${row}`).font = normalFont

  sheet.getCell(`F${row}`).value = 'Tot. Horas Extras'
  sheet.getCell(`F${row}`).font = boldFont
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`F${row}`).border = borderThin

  sheet.mergeCells(`G${row}:H${row}`)
  sheet.getCell(`G${row}`).value = minutesToHoursString(totalExtras)
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`G${row}`).border = borderThin
  sheet.getCell(`G${row}`).font = normalFont
  row++

  // Linha 2: Intrajornada e Gratificacao
  sheet.mergeCells(`A${row}:C${row}`)
  sheet.getCell(`A${row}`).value = 'Intrajornada'
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`A${row}`).border = borderThin

  sheet.mergeCells(`D${row}:E${row}`)
  sheet.getCell(`D${row}`).value = ''
  sheet.getCell(`D${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`D${row}`).border = borderThin

  sheet.getCell(`F${row}`).value = 'Gratificacao'
  sheet.getCell(`F${row}`).font = boldFont
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`F${row}`).border = borderThin

  sheet.mergeCells(`G${row}:H${row}`)
  sheet.getCell(`G${row}`).value = ''
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`G${row}`).border = borderThin
  row++

  // Linha 3: Adicional Noturno e Assiduidade
  sheet.mergeCells(`A${row}:C${row}`)
  sheet.getCell(`A${row}`).value = 'Adicional Noturno'
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`A${row}`).border = borderThin

  sheet.mergeCells(`D${row}:E${row}`)
  sheet.getCell(`D${row}`).value = ''
  sheet.getCell(`D${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`D${row}`).border = borderThin

  sheet.getCell(`F${row}`).value = 'Assiduidade'
  sheet.getCell(`F${row}`).font = boldFont
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`F${row}`).border = borderThin

  sheet.mergeCells(`G${row}:H${row}`)
  sheet.getCell(`G${row}`).value = ''
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`G${row}`).border = borderThin
  row++

  // Linha 4: Horas Noturnas Reduzidas e Vale Alimentacao
  sheet.mergeCells(`A${row}:C${row}`)
  sheet.getCell(`A${row}`).value = 'Horas Noturnas Reduzidas'
  sheet.getCell(`A${row}`).font = boldFont
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`A${row}`).border = borderThin

  sheet.mergeCells(`D${row}:E${row}`)
  sheet.getCell(`D${row}`).value = ''
  sheet.getCell(`D${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`D${row}`).border = borderThin

  sheet.getCell(`F${row}`).value = 'Vale Alimentacao'
  sheet.getCell(`F${row}`).font = boldFont
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`F${row}`).border = borderThin

  sheet.mergeCells(`G${row}:H${row}`)
  sheet.getCell(`G${row}`).value = ''
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`G${row}`).border = borderThin
  row++

  // Linhas vazias
  row += 2

  // === RODAPE ===
  sheet.mergeCells(`A${row}:H${row}`)
  sheet.getCell(`A${row}`).value = 'Reconheco a exatidao destas anotacoes em ____/____/____'
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`A${row}`).font = normalFont
  row += 2

  sheet.mergeCells(`A${row}:H${row}`)
  sheet.getCell(`A${row}`).value = 'Assinatura: ________________________________________'
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' }
  sheet.getCell(`A${row}`).font = normalFont

  // Gerar o arquivo
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// Funcao para calcular periodo 20 a 20
export function getPeriodo20a20(): { dataInicio: string; dataFim: string } {
  const hoje = new Date()
  const diaAtual = hoje.getDate()

  let dataInicio: Date
  let dataFim: Date

  if (diaAtual >= 20) {
    // Estamos no dia 20 ou depois: periodo vai do dia 20 deste mes ate dia 20 do proximo mes
    dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 20)
    dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 20)
  } else {
    // Estamos antes do dia 20: periodo vai do dia 20 do mes anterior ate dia 20 deste mes
    dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 20)
    dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 20)
  }

  return {
    dataInicio: dataInicio.toISOString().split('T')[0],
    dataFim: dataFim.toISOString().split('T')[0]
  }
}
