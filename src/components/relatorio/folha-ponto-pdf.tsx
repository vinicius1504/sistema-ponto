'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import {
  getDayOfWeek,
  minutesToHoursString,
  formatTimeFromString,
  generateDateRange,
  createRegistroMap,
  getRegistroByDate
} from '@/lib/utils'
import type { Registro, Usuario } from '@/types'

interface FolhaPontoPDFProps {
  usuario: Usuario
  registros: Registro[]
  dataInicio: Date
  dataFim: Date
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica'
  },
  // Cabeçalho
  header: {
    border: '1px solid black'
  },
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#c0c0c0',
    padding: 6,
    borderBottom: '1px solid black'
  },
  headerTitleText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11
  },
  headerInfo: {
    flexDirection: 'row'
  },
  headerColumn: {
    flex: 1,
    padding: 6
  },
  headerRow: {
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase'
  },
  // Tabela
  table: {
    marginTop: 0,
    border: '1px solid black',
    borderTop: 0
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#c0c0c0',
    borderBottom: '1px solid black'
  },
  tableSubHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#c0c0c0',
    borderBottom: '1px solid black'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    minHeight: 16
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 16
  },
  // Células
  cellDia: {
    width: 20,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  cellDiaSemana: {
    width: 25,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  cellHora: {
    width: 45,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  cellExtra: {
    width: 40,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  cellAssinatura: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  cellText: {
    textAlign: 'center'
  },
  cellTextBold: {
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold'
  },
  // Headers da tabela
  headerCellDias: {
    width: 45,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  },
  headerCellNormal: {
    width: 180,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  },
  headerCellExtra: {
    width: 40,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  },
  headerCellAssinatura: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  },
  // Sub-headers
  subHeaderCell: {
    width: 45,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  subHeaderCellIntervalo: {
    width: 90,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  // Totalizadores
  totalizadores: {
    marginTop: 0,
    border: '1px solid black',
    borderTop: 0
  },
  totalizadorRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    minHeight: 16
  },
  totalizadorRowLast: {
    flexDirection: 'row',
    minHeight: 16
  },
  totalizadorLabel: {
    flex: 1,
    borderRight: '1px solid black',
    justifyContent: 'center',
    paddingLeft: 4,
    padding: 2
  },
  totalizadorValue: {
    width: 60,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  totalizadorLabelBold: {
    fontFamily: 'Helvetica-Bold'
  },
  // Rodapé
  footer: {
    marginTop: 20,
    textAlign: 'right'
  },
  footerText: {
    marginBottom: 16
  }
})

export const FolhaPontoPDF = ({ usuario, registros, dataInicio, dataFim }: FolhaPontoPDFProps) => {
  const days = generateDateRange(dataInicio, dataFim)
  const registroMap = createRegistroMap(registros)
  const formatPeriodo = () => `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`

  // Usa dados customizados do usuario ou fallback para dados da empresa
  const empresaNome = usuario.empresaNomeCustom || usuario.empresa.nome
  const empresaCnpj = usuario.empresaCnpjCustom || usuario.empresa.cnpj
  const empresaEndereco = usuario.empresaEnderecoCustom || usuario.empresa.endereco
  const empresaAtividade = usuario.empresaAtividadeCustom || usuario.empresa.atividade
  const empresaServico = usuario.empresaServicoCustom || usuario.empresa.servico || empresaNome

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>FOLHA INDIVIDUAL DE PRESENCA</Text>
            <Text style={styles.headerTitleText}>Periodo: {formatPeriodo()}</Text>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.headerColumn}>
              <Text style={styles.headerRow}>EMPRESA: {empresaNome.toUpperCase()}</Text>
              <Text style={styles.headerRow}>SERVICO: {empresaServico.toUpperCase()}</Text>
              <Text style={styles.headerRow}>ATIVIDADE: {empresaAtividade.toUpperCase()}</Text>
              <Text style={styles.headerRow}>ENDERECO: {empresaEndereco.toUpperCase()}</Text>
              <Text style={styles.headerRow}>FUNCIONARIO: {usuario.codigoFuncionario} - {usuario.nome.toUpperCase()}</Text>
              <Text style={styles.headerRow}>CARGO: {usuario.codigoCargo} - {usuario.cargo.toUpperCase()}</Text>
            </View>
            <View style={styles.headerColumn}>
              <Text style={styles.headerRow}>CNPJ/CPF: {empresaCnpj}</Text>
              <Text style={styles.headerRow}> </Text>
              <Text style={styles.headerRow}> </Text>
              <Text style={styles.headerRow}>CTPS/SERIE: {usuario.ctps}/{usuario.ctpsSerie}</Text>
              <Text style={styles.headerRow}>DEPTO: {usuario.codigoDepartamento} - {usuario.departamento.toUpperCase()}</Text>
              <Text style={styles.headerRow}>PIS: {usuario.pis}</Text>
            </View>
          </View>
        </View>

        {/* Tabela de Registros */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.headerCellDias}>
              <Text style={styles.cellTextBold}>Dias</Text>
            </View>
            <View style={styles.headerCellNormal}>
              <Text style={styles.cellTextBold}>Normal</Text>
            </View>
            <View style={styles.headerCellExtra}>
              <Text style={styles.cellTextBold}>Extra</Text>
            </View>
            <View style={styles.headerCellAssinatura}>
              <Text style={styles.cellTextBold}>Assinatura</Text>
            </View>
          </View>

          {/* Sub-header */}
          <View style={styles.tableSubHeaderRow}>
            <View style={styles.cellDia}><Text> </Text></View>
            <View style={styles.cellDiaSemana}><Text> </Text></View>
            <View style={styles.subHeaderCell}>
              <Text style={styles.cellTextBold}>Inicio</Text>
            </View>
            <View style={styles.subHeaderCellIntervalo}>
              <Text style={styles.cellTextBold}>Intervalo</Text>
            </View>
            <View style={styles.subHeaderCell}>
              <Text style={styles.cellTextBold}>Termino</Text>
            </View>
            <View style={styles.cellExtra}><Text> </Text></View>
            <View style={styles.cellAssinatura}><Text> </Text></View>
          </View>

          {/* Dados */}
          {days.map((day, index) => {
            const registro = getRegistroByDate(registroMap, day)
            const isLast = index === days.length - 1

            return (
              <View key={day.toISOString()} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <View style={styles.cellDia}>
                  <Text style={styles.cellText}>{day.getDate().toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.cellDiaSemana}>
                  <Text style={styles.cellText}>{getDayOfWeek(day)}</Text>
                </View>
                <View style={styles.cellHora}>
                  <Text style={styles.cellText}>{formatTimeFromString(registro?.entrada || null)}</Text>
                </View>
                <View style={styles.cellHora}>
                  <Text style={styles.cellText}>{formatTimeFromString(registro?.saidaAlmoco || null)}</Text>
                </View>
                <View style={styles.cellHora}>
                  <Text style={styles.cellText}>{formatTimeFromString(registro?.voltaAlmoco || null)}</Text>
                </View>
                <View style={styles.cellHora}>
                  <Text style={styles.cellText}>{formatTimeFromString(registro?.saida || null)}</Text>
                </View>
                <View style={styles.cellExtra}>
                  <Text style={styles.cellText}>
                    {registro?.horasExtras ? minutesToHoursString(registro.horasExtras) : ''}
                  </Text>
                </View>
                <View style={styles.cellAssinatura}>
                  <Text> </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Totalizadores */}
        <View style={styles.totalizadores}>
          <View style={styles.totalizadorRow}>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Tot. Horas Trabalhadas</Text>
            </View>
            <View style={styles.totalizadorValue}><Text> </Text></View>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Tot. Horas Extras</Text>
            </View>
            <View style={[styles.totalizadorValue, { borderRight: 0 }]}><Text> </Text></View>
          </View>
          <View style={styles.totalizadorRow}>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Intrajornada</Text>
            </View>
            <View style={styles.totalizadorValue}><Text> </Text></View>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Gratificacao</Text>
            </View>
            <View style={[styles.totalizadorValue, { borderRight: 0 }]}><Text> </Text></View>
          </View>
          <View style={styles.totalizadorRow}>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Adicional Noturno</Text>
            </View>
            <View style={styles.totalizadorValue}><Text> </Text></View>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Assiduidade</Text>
            </View>
            <View style={[styles.totalizadorValue, { borderRight: 0 }]}><Text> </Text></View>
          </View>
          <View style={styles.totalizadorRowLast}>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Horas Noturnas Reduzidas</Text>
            </View>
            <View style={styles.totalizadorValue}><Text> </Text></View>
            <View style={styles.totalizadorLabel}>
              <Text style={styles.totalizadorLabelBold}>Vale Alimentacao</Text>
            </View>
            <View style={[styles.totalizadorValue, { borderRight: 0 }]}><Text> </Text></View>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Reconheco a exatidao destas anotacoes em ____/____/____</Text>
          <Text>Assinatura: ________________________________________</Text>
        </View>
      </Page>
    </Document>
  )
}
