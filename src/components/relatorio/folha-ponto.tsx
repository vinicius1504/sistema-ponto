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

    return (
      <div
        ref={ref}
        className="bg-white p-8 font-sans text-black"
        style={{ width: '210mm', minHeight: '297mm', fontSize: '11px' }}
      >
        {/* Cabeçalho */}
        <div className="border border-black">
          <div className="flex justify-between items-start p-2 border-b border-black">
            <div className="font-bold text-sm">FOLHA INDIVIDUAL DE PRESENCA</div>
            <div className="text-right">
              <span className="font-bold">Periodo: </span>
              {formatPeriodo()}
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
        <table className="w-full border-collapse mt-0 border border-black">
          <thead>
            <tr style={{ height: '24px' }}>
              <th
                colSpan={2}
                className="border border-black text-center font-bold"
                style={{ verticalAlign: 'middle', padding: '2px' }}
              >
                Dias
              </th>
              <th
                colSpan={4}
                className="border border-black text-center font-bold"
                style={{ verticalAlign: 'middle', padding: '2px' }}
              >
                Normal
              </th>
              <th className="border border-black text-center font-bold" style={{ verticalAlign: 'middle', padding: '2px' }}>
                Extra
              </th>
              <th className="border border-black text-center font-bold" style={{ verticalAlign: 'middle', padding: '2px' }}>
                Assinatura
              </th>
            </tr>
            <tr style={{ height: '20px' }}>
              <th className="border border-black w-8" style={{ verticalAlign: 'middle', padding: '2px' }}></th>
              <th className="border border-black w-10" style={{ verticalAlign: 'middle', padding: '2px' }}></th>
              <th className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>Inicio</th>
              <th className="border border-black text-center border-r-2" style={{ verticalAlign: 'middle', padding: '2px' }}>Saida</th>
              <th className="border border-black text-center border-l-0" style={{ verticalAlign: 'middle', padding: '2px' }}>Volta</th>
              <th className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>Termino</th>
              <th className="border border-black w-16" style={{ verticalAlign: 'middle', padding: '2px' }}></th>
              <th className="border border-black w-32" style={{ verticalAlign: 'middle', padding: '2px' }}></th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const registro = getRegistroForDate(day)

              return (
                <tr key={day.toISOString()} style={{ height: '20px' }}>
                  <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {day.getDate().toString().padStart(2, '0')}
                  </td>
                  <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {getDayOfWeek(day)}
                  </td>
                  <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {formatTimeFromString(registro?.entrada || null)}
                  </td>
                  <td className="border border-black text-center border-r-2" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {formatTimeFromString(registro?.saidaAlmoco || null)}
                  </td>
                  <td className="border border-black text-center border-l-0" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {formatTimeFromString(registro?.voltaAlmoco || null)}
                  </td>
                  <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {formatTimeFromString(registro?.saida || null)}
                  </td>
                  <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                    {registro?.horasExtras
                      ? minutesToHoursString(registro.horasExtras)
                      : ''}
                  </td>
                  <td className="border border-black" style={{ verticalAlign: 'middle', padding: '2px' }}>&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totalizadores */}
        <table className="w-full border-collapse border border-black mt-0">
          <tbody>
            <tr style={{ height: '20px' }}>
              <td className="border border-black w-1/2 text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Tot. Horas Trabalhadas</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                {minutesToHoursString(totalHoras)}
              </td>
              <td className="border border-black w-1/4 text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Tot. Horas Extras</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                {minutesToHoursString(totalExtras)}
              </td>
            </tr>
            <tr style={{ height: '20px' }}>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Intrajornada</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}></td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Gratificacao</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}></td>
            </tr>
            <tr style={{ height: '20px' }}>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Adicional Noturno</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}></td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Assiduidade</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}></td>
            </tr>
            <tr style={{ height: '20px' }}>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Horas Noturnas Reduzidas</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}></td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}>
                <span className="font-bold">Vale Alimentacao</span>
              </td>
              <td className="border border-black text-center" style={{ verticalAlign: 'middle', padding: '2px' }}></td>
            </tr>
          </tbody>
        </table>

        {/* Rodapé */}
        <div className="mt-8 text-center">
          <p>
            Reconheco a exatidao destas anotacoes em ____/____/____
          </p>
          <p className="mt-8">
            Assinatura: ________________________________________
          </p>
        </div>
      </div>
    )
  }
)

FolhaPonto.displayName = 'FolhaPonto'

export { FolhaPonto }
