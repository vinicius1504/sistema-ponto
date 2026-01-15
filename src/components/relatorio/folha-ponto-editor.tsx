'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CheckIcon, ErrorIcon, SparklesIcon } from '@/components/icons'
import { pontoService } from '@/services/api'
import {
  getDayOfWeek,
  formatTimeForInput,
  generateDateRange,
  createRegistroMap
} from '@/lib/utils'
import type { Registro, EditPontoData, Usuario } from '@/types'

// Horario base da empresa
// Entrada: 07:30 | Almoco: 11:30-12:45 (1h15min) | Saida: 17:30
// Jornada: 4h (manha) + 4h45m (tarde) = 8h45min = 525 minutos
const HORARIO_BASE = {
  entrada: 7 * 60 + 30,      // 07:30 = 450 min
  saidaAlmoco: 11 * 60 + 30, // 11:30 = 690 min
  voltaAlmoco: 12 * 60 + 45, // 12:45 = 765 min
  saida: 17 * 60 + 30        // 17:30 = 1050 min
}

// Jornada exata em minutos (8h45min)
const JORNADA_MINUTOS = 525

// Variacao maxima em minutos para cada horario
const VARIACAO_MAX = 7

// Gera um numero aleatorio entre min e max
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Formata minutos totais para string HH:MM
function formatMinutesToTime(totalMinutos: number): string {
  const hora = Math.floor(totalMinutos / 60)
  const minuto = totalMinutos % 60
  return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
}

// Gera horarios aleatorios mantendo a jornada EXATA de 8h45min
function generateRandomSchedule(): { entrada: string; saidaAlmoco: string; voltaAlmoco: string; saida: string } {
  // Varia entrada (±7 min)
  const entradaVar = randomBetween(-VARIACAO_MAX, VARIACAO_MAX)
  const entrada = HORARIO_BASE.entrada + entradaVar

  // Varia saida almoco (±7 min)
  const saidaAlmocoVar = randomBetween(-VARIACAO_MAX, VARIACAO_MAX)
  const saidaAlmoco = HORARIO_BASE.saidaAlmoco + saidaAlmocoVar

  // Varia volta almoco (±7 min)
  const voltaAlmocoVar = randomBetween(-VARIACAO_MAX, VARIACAO_MAX)
  const voltaAlmoco = HORARIO_BASE.voltaAlmoco + voltaAlmocoVar

  // Calcula horas trabalhadas na manha
  const horasManha = saidaAlmoco - entrada

  // Calcula quanto falta para completar a jornada exata
  const horasTardeNecessarias = JORNADA_MINUTOS - horasManha

  // Saida = volta do almoco + horas necessarias na tarde
  const saida = voltaAlmoco + horasTardeNecessarias

  return {
    entrada: formatMinutesToTime(entrada),
    saidaAlmoco: formatMinutesToTime(saidaAlmoco),
    voltaAlmoco: formatMinutesToTime(voltaAlmoco),
    saida: formatMinutesToTime(saida)
  }
}

interface FolhaPontoEditorProps {
  usuario: Usuario
  registros: Registro[]
  dataInicio: Date
  dataFim: Date
  usuarioId?: string
  onSave: () => void
  onCancel: () => void
}

interface EditableRegistro {
  data: string
  entrada: string
  saidaAlmoco: string
  voltaAlmoco: string
  saida: string
  modified: boolean
}

export function FolhaPontoEditor({
  usuario,
  registros,
  dataInicio,
  dataFim,
  usuarioId,
  onSave,
  onCancel
}: FolhaPontoEditorProps) {
  const [editableData, setEditableData] = useState<EditableRegistro[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedRows, setSavedRows] = useState<Set<string>>(new Set())

  // Memoize expensive calculations
  const days = useMemo(() => generateDateRange(dataInicio, dataFim), [dataInicio, dataFim])
  const registroMap = useMemo(() => createRegistroMap(registros), [registros])

  useEffect(() => {
    const data = days.map(day => {
      const dateStr = day.toISOString().split('T')[0]
      const registro = registroMap.get(dateStr)
      return {
        data: dateStr,
        entrada: formatTimeForInput(registro?.entrada || null),
        saidaAlmoco: formatTimeForInput(registro?.saidaAlmoco || null),
        voltaAlmoco: formatTimeForInput(registro?.voltaAlmoco || null),
        saida: formatTimeForInput(registro?.saida || null),
        modified: false
      }
    })
    setEditableData(data)
  }, [days, registroMap])

  const handleChange = useCallback((index: number, field: keyof EditPontoData, value: string) => {
    setEditableData(prev => {
      const newData = [...prev]
      newData[index] = {
        ...newData[index],
        [field]: value,
        modified: true
      }
      // Remove from saved rows if modified again
      setSavedRows(prevSaved => {
        const newSet = new Set(prevSaved)
        newSet.delete(newData[index].data)
        return newSet
      })
      return newData
    })
    setError('')
  }, [])

  const handleSaveRow = async (index: number) => {
    const row = editableData[index]
    if (!row.modified) return

    try {
      const updates: EditPontoData = {
        entrada: row.entrada || null,
        saidaAlmoco: row.saidaAlmoco || null,
        voltaAlmoco: row.voltaAlmoco || null,
        saida: row.saida || null
      }

      await pontoService.editarPonto(row.data, updates, usuarioId)

      setEditableData(prev => {
        const newData = [...prev]
        newData[index] = { ...newData[index], modified: false }
        return newData
      })

      setSavedRows(prev => new Set(prev).add(row.data))
    } catch (err) {
      throw err
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setError('')

    try {
      const modifiedRows = editableData.filter(row => row.modified)

      for (let i = 0; i < editableData.length; i++) {
        if (editableData[i].modified) {
          await handleSaveRow(i)
        }
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alteracoes')
    } finally {
      setSaving(false)
    }
  }

  const modifiedCount = editableData.filter(r => r.modified).length

  const formatPeriodo = () => {
    return `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`
  }

  // Preenche automaticamente todos os dias uteis com horarios aleatorios
  const handleAutoFill = useCallback(() => {
    setEditableData(prev => {
      return prev.map(row => {
        const day = new Date(row.data + 'T12:00:00')
        const isWeekend = day.getDay() === 0 || day.getDay() === 6

        // Pula fins de semana
        if (isWeekend) {
          return row
        }

        // Gera horarios aleatorios
        const schedule = generateRandomSchedule()

        return {
          ...row,
          entrada: schedule.entrada,
          saidaAlmoco: schedule.saidaAlmoco,
          voltaAlmoco: schedule.voltaAlmoco,
          saida: schedule.saida,
          modified: true
        }
      })
    })
    setSavedRows(new Set())
    setError('')
  }, [])

  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">EDITOR DE PONTO</h2>
            <p className="text-slate-300 text-sm">Periodo: {formatPeriodo()}</p>
          </div>
          <button
            onClick={handleAutoFill}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            title="Preencher automaticamente com horarios aleatorios"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Auto Preencher</span>
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-blue-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <p className="text-sm text-blue-700">
          {modifiedCount > 0 ? (
            <span className="font-medium">{modifiedCount} dia(s) modificado(s)</span>
          ) : (
            <span>Clique nos campos para editar os horarios</span>
          )}
        </p>
        {savedRows.size > 0 && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <CheckIcon className="w-4 h-4" />
            {savedRows.size} salvo(s)
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-100">
            <tr className="border-b border-slate-200">
              <th className="px-3 py-2 text-left font-semibold text-slate-600 w-12">Dia</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600 w-16">Sem</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600">Entrada</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600">Saida Almoco</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600">Volta Almoco</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600">Saida</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600 w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {editableData.map((row, index) => {
              const day = new Date(row.data + 'T12:00:00')
              const isWeekend = day.getDay() === 0 || day.getDay() === 6
              const isSaved = savedRows.has(row.data)

              return (
                <tr
                  key={row.data}
                  className={`border-b border-slate-100 transition-colors ${
                    isWeekend ? 'bg-slate-50' : ''
                  } ${row.modified ? 'bg-amber-50' : ''} ${isSaved ? 'bg-emerald-50' : ''}`}
                >
                  <td className="px-3 py-1 text-slate-700 font-medium">
                    {day.getDate().toString().padStart(2, '0')}
                  </td>
                  <td className="px-3 py-1 text-slate-500 text-xs uppercase">
                    {getDayOfWeek(day)}
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="time"
                      value={row.entrada}
                      onChange={(e) => handleChange(index, 'entrada', e.target.value)}
                      className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="time"
                      value={row.saidaAlmoco}
                      onChange={(e) => handleChange(index, 'saidaAlmoco', e.target.value)}
                      className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="time"
                      value={row.voltaAlmoco}
                      onChange={(e) => handleChange(index, 'voltaAlmoco', e.target.value)}
                      className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="time"
                      value={row.saida}
                      onChange={(e) => handleChange(index, 'saida', e.target.value)}
                      className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-3 py-1 text-center">
                    {isSaved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                        <CheckIcon className="w-3 h-3" /> Salvo
                      </span>
                    ) : row.modified ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs">
                        Modificado
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 my-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <ErrorIcon className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <p className="text-sm text-slate-500">
          {modifiedCount > 0
            ? `${modifiedCount} alteracao(es) pendente(s)`
            : 'Nenhuma alteracao pendente'
          }
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={modifiedCount === 0 || saving}
            loading={saving}
          >
            Salvar Alteracoes
          </Button>
        </div>
      </div>
    </div>
  )
}
