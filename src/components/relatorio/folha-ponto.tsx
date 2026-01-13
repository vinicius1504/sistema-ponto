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
            <div className="border-r border-black p-2 space-y-1">
              <div>
                <span className="font-bold">Empresa: </span>
                {usuario.empresa.nome}
              </div>
              <div>
                <span className="font-bold">Servico: </span>
                {usuario.empresa.servico || usuario.empresa.nome}
              </div>
              <div>
                <span className="font-bold">Atividade: </span>
                {usuario.empresa.atividade}
              </div>
              <div>
                <span className="font-bold">Endereco: </span>
                {usuario.empresa.endereco}
              </div>
              <div>
                <span className="font-bold">Funcionario: </span>
                {usuario.codigoFuncionario} - {usuario.nome}
              </div>
              <div>
                <span className="font-bold">Cargo: </span>
                {usuario.codigoCargo} - {usuario.cargo}
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="p-2 space-y-1">
              <div>
                <span className="font-bold">CNPJ/CPF: </span>
                {usuario.empresa.cnpj}
              </div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>
                <span className="font-bold">CTPS/Serie: </span>
                {usuario.ctps}/{usuario.ctpsSerie}
              </div>
              <div>
                <span className="font-bold">Depto: </span>
                {usuario.codigoDepartamento} - {usuario.departamento}
              </div>
              <div>
                <span className="font-bold">PIS: </span>
                {usuario.pis}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Registros */}
        <table className="w-full border-collapse mt-0 border border-black">
          <thead>
            <tr>
              <th
                colSpan={2}
                className="border border-black p-1 text-center font-bold"
              >
                Dias
              </th>
              <th
                colSpan={3}
                className="border border-black p-1 text-center font-bold"
              >
                Normal
              </th>
              <th className="border border-black p-1 text-center font-bold">
                Extra
              </th>
              <th className="border border-black p-1 text-center font-bold">
                Assinatura
              </th>
            </tr>
            <tr>
              <th className="border border-black p-1 w-8"></th>
              <th className="border border-black p-1 w-10"></th>
              <th className="border border-black p-1 text-center">Inicio</th>
              <th className="border border-black p-1 text-center">Intervalo</th>
              <th className="border border-black p-1 text-center">Termino</th>
              <th className="border border-black p-1 w-16"></th>
              <th className="border border-black p-1 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const registro = getRegistroForDate(day)
              const intervalo =
                registro?.saidaAlmoco && registro?.voltaAlmoco
                  ? `${formatTimeFromString(registro.saidaAlmoco)} ${formatTimeFromString(registro.voltaAlmoco)}`
                  : ''

              return (
                <tr key={day.toISOString()}>
                  <td className="border border-black p-1 text-center">
                    {day.getDate().toString().padStart(2, '0')}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {getDayOfWeek(day)}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {formatTimeFromString(registro?.entrada || null)}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {intervalo}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {formatTimeFromString(registro?.saida || null)}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {registro?.horasExtras
                      ? minutesToHoursString(registro.horasExtras)
                      : ''}
                  </td>
                  <td className="border border-black p-1">&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totalizadores */}
        <table className="w-full border-collapse border border-black mt-0">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-1/2">
                <span className="font-bold">Tot. Horas Trabalhadas</span>
              </td>
              <td className="border border-black p-1">
                {minutesToHoursString(totalHoras)}
              </td>
              <td className="border border-black p-1 w-1/4">
                <span className="font-bold">Tot. Horas Extras</span>
              </td>
              <td className="border border-black p-1">
                {minutesToHoursString(totalExtras)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                <span className="font-bold">Intrajornada</span>
              </td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">
                <span className="font-bold">Gratificacao</span>
              </td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                <span className="font-bold">Adicional Noturno</span>
              </td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">
                <span className="font-bold">Assiduidade</span>
              </td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                <span className="font-bold">Horas Noturnas Reduzidas</span>
              </td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">
                <span className="font-bold">Vale Alimentacao</span>
              </td>
              <td className="border border-black p-1"></td>
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
