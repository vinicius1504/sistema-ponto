'use client'

import { forwardRef, useMemo } from 'react'
import {
  getDayOfWeek,
  minutesToHoursString,
  formatTimeFromString,
  generateDateRange,
  createRegistroMap,
  getRegistroByDate
} from '@/lib/utils'
import type { Registro, Usuario } from '@/types'

interface FolhaPontoProps {
  usuario: Usuario
  registros: Registro[]
  dataInicio: Date
  dataFim: Date
}

const FolhaPonto = forwardRef<HTMLDivElement, FolhaPontoProps>(
  ({ usuario, registros, dataInicio, dataFim }, ref) => {
    // Memoize expensive calculations
    const registroMap = useMemo(() => createRegistroMap(registros), [registros])
    const days = useMemo(() => generateDateRange(dataInicio, dataFim), [dataInicio, dataFim])

    // Usa dados customizados do usuario ou fallback para dados da empresa
    const empresaNome = usuario.empresaNomeCustom || usuario.empresa.nome
    const empresaCnpj = usuario.empresaCnpjCustom || usuario.empresa.cnpj
    const empresaEndereco = usuario.empresaEnderecoCustom || usuario.empresa.endereco
    const empresaAtividade = usuario.empresaAtividadeCustom || usuario.empresa.atividade
    const empresaServico = usuario.empresaServicoCustom || usuario.empresa.servico || empresaNome

    const formatPeriodo = () => {
      return `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`
    }

    // Estilo das células - usando line-height para centralização vertical (mais compatível com html2canvas)
    const cellStyle: React.CSSProperties = {
      height: '20px',
      lineHeight: '20px',
      padding: 0,
      textAlign: 'center',
      verticalAlign: 'middle'
    }

    return (
      <div
        ref={ref}
        className="bg-white p-8 font-sans text-black"
        style={{ width: '210mm', minHeight: '297mm', fontSize: '11px' }}
      >
        {/* Cabeçalho */}
        <div className="border border-black">
          <div className="flex justify-between items-start p-2 border-b border-black" style={{ backgroundColor: '#c0c0c0' }}>
            <div className="font-bold text-sm">FOLHA INDIVIDUAL DE PRESENCA</div>
            <div className="text-right font-bold">
              Periodo: {formatPeriodo()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {/* Coluna Esquerda */}
            <div className="p-2 space-y-1 font-bold uppercase">
              <div>
                <span>Empresa: </span>
                {empresaNome}
              </div>
              <div>
                <span>Servico: </span>
                {empresaServico}
              </div>
              <div>
                <span>Atividade: </span>
                {empresaAtividade}
              </div>
              <div>
                <span>Endereco: </span>
                {empresaEndereco}
              </div>
              <div>
                <span>Funcionario: </span>
                {usuario.codigoFuncionario} - {usuario.nome}
              </div>
              <div>
                <span>Cargo: </span>
                {usuario.codigoCargo} - {usuario.cargo}
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="p-2 space-y-1 font-bold uppercase">
              <div>
                <span>CNPJ/CPF: </span>
                {empresaCnpj}
              </div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>
                <span>CTPS/Serie: </span>
                {usuario.ctps}/{usuario.ctpsSerie}
              </div>
              <div>
                <span>Depto: </span>
                {usuario.codigoDepartamento} - {usuario.departamento}
              </div>
              <div>
                <span>PIS: </span>
                {usuario.pis}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Registros */}
        <table className="w-full border-collapse mt-0 border border-black" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th
                colSpan={2}
                rowSpan={2}
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Dias
              </th>
              <th
                colSpan={4}
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Normal
              </th>
              <th
                rowSpan={2}
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Extra
              </th>
              <th
                rowSpan={2}
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Assinatura
              </th>
            </tr>
            <tr>
              <th
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Inicio
              </th>
              <th
                colSpan={2}
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Intervalo
              </th>
              <th
                className="border border-black text-center font-bold"
                style={{ height: '24px', padding: 0, backgroundColor: '#c0c0c0', verticalAlign: 'middle' }}
              >
                Termino
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const registro = getRegistroByDate(registroMap, day)

              return (
                <tr key={day.toISOString()}>
                  <td className="border border-black" style={cellStyle}>
                    {day.getDate().toString().padStart(2, '0')}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    {getDayOfWeek(day)}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    {formatTimeFromString(registro?.entrada || null)}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    {formatTimeFromString(registro?.saidaAlmoco || null)}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    {formatTimeFromString(registro?.voltaAlmoco || null)}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    {formatTimeFromString(registro?.saida || null)}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    {registro?.horasExtras
                      ? minutesToHoursString(registro.horasExtras)
                      : ''}
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    &nbsp;
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totalizadores */}
        <table className="w-full border-collapse border border-black mt-0" style={{ fontSize: '13px' }}>
          <tbody>
            <tr>
              <td className="border border-black w-1/2 font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Tot. Horas Trabalhadas
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}>
              </td>
              <td className="border border-black w-1/4 font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Tot. Horas Extras
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}>
              </td>
            </tr>
            <tr>
              <td className="border border-black font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Intrajornada
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}></td>
              <td className="border border-black font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Gratificacao
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}></td>
            </tr>
            <tr>
              <td className="border border-black font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Adicional Noturno
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}></td>
              <td className="border border-black font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Assiduidade
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}></td>
            </tr>
            <tr>
              <td className="border border-black font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Horas Noturnas Reduzidas
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}></td>
              <td className="border border-black font-bold" style={{ height: '20px', paddingLeft: '4px', textAlign: 'left', verticalAlign: 'middle' }}>
                Vale Alimentacao
              </td>
              <td className="border border-black text-center" style={{ height: '20px', padding: 0, verticalAlign: 'middle' }}></td>
            </tr>
          </tbody>
        </table>

        {/* Rodapé */}
        <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '13px' }}>
          <p style={{ margin: 0 }}>
            Reconheco a exatidao destas anotacoes em ____/____/____
          </p>
          <p style={{ marginTop: '16px', marginBottom: 0 }}>
            Assinatura: ________________________________________
          </p>
        </div>
      </div>
    )
  }
)

FolhaPonto.displayName = 'FolhaPonto'

export { FolhaPonto }