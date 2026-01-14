'use client'

import { forwardRef } from 'react'
import { getDayOfWeek, minutesToHoursString } from '@/lib/utils'

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
  empresa: {
    nome: string
    cnpj: string
    endereco: string
    atividade: string
    servico: string | null
  }
}

interface FolhaPontoProps {
  usuario: Usuario
  registros: Registro[]
  dataInicio: Date
  dataFim: Date
}

const FolhaPonto = forwardRef<HTMLDivElement, FolhaPontoProps>(
  ({ usuario, registros, dataInicio, dataFim }, ref) => {
    const formatTimeFromString = (timeStr: string | null): string => {
      if (!timeStr) return ''
      try {
        const date = new Date(timeStr)
        return date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return ''
      }
    }

    const generateDays = () => {
      const days = []
      const current = new Date(dataInicio)
      while (current <= dataFim) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      return days
    }

    const getRegistroForDate = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0]
      return registros.find((r) => r.data.startsWith(dateStr))
    }

    const calculateTotalHours = () => {
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

    const calculateTotalExtras = () => {
      return registros.reduce((acc, r) => acc + (r.horasExtras || 0), 0)
    }

    const days = generateDays()
    const totalHoras = calculateTotalHours()
    const totalExtras = calculateTotalExtras()

    const formatPeriodo = () => {
      return `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`
    }

    // Estilo das células com display flex para centralização perfeita
    const cellStyle: React.CSSProperties = {
      height: '20px',
      padding: 0,
      verticalAlign: 'middle',
      textAlign: 'center'
    }

    // Estilo para o conteúdo interno das células (centralização com flexbox)
    const cellContentStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%'
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
                {usuario.empresa.nome}
              </div>
              <div>
                <span>Servico: </span>
                {usuario.empresa.servico || usuario.empresa.nome}
              </div>
              <div>
                <span>Atividade: </span>
                {usuario.empresa.atividade}
              </div>
              <div>
                <span>Endereco: </span>
                {usuario.empresa.endereco}
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
                {usuario.empresa.cnpj}
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
              const registro = getRegistroForDate(day)

              return (
                <tr key={day.toISOString()}>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {day.getDate().toString().padStart(2, '0')}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {getDayOfWeek(day)}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {formatTimeFromString(registro?.entrada || null)}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {formatTimeFromString(registro?.saidaAlmoco || null)}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {formatTimeFromString(registro?.voltaAlmoco || null)}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {formatTimeFromString(registro?.saida || null)}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>
                      {registro?.horasExtras
                        ? minutesToHoursString(registro.horasExtras)
                        : ''}
                    </div>
                  </td>
                  <td className="border border-black" style={cellStyle}>
                    <div style={cellContentStyle}>&nbsp;</div>
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