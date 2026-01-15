'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ClockIcon, CheckIcon, SuccessIcon, ErrorIcon, EditIcon } from '@/components/icons'
import { PunchEditor } from '@/components/ponto/punch-editor'
import { useCurrentTime } from '@/hooks'
import { pontoService } from '@/services/api'
import { formatTime, getDayOfWeek, getPunchTypeLabel } from '@/lib/utils'
import type { TodayPunch, PunchType } from '@/types'

export default function PontoPage() {
  const currentTime = useCurrentTime()
  const [todayPunch, setTodayPunch] = useState<TodayPunch | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchTodayPunch = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const data = await pontoService.getTodayPunch(today)
      setTodayPunch(data.registro)
    } catch (error) {
      console.error('Erro ao buscar ponto:', error)
    }
  }, [])

  useEffect(() => {
    fetchTodayPunch()
  }, [fetchTodayPunch])

  const getNextPunch = (): PunchType => {
    if (!todayPunch) return 'entrada'
    if (!todayPunch.entrada) return 'entrada'
    if (!todayPunch.saidaAlmoco) return 'saidaAlmoco'
    if (!todayPunch.voltaAlmoco) return 'voltaAlmoco'
    if (!todayPunch.saida) return 'saida'
    return 'completo'
  }

  const handleBaterPonto = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const data = await pontoService.baterPonto()
      setMessage({ type: 'success', text: data.mensagem })
      fetchTodayPunch()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao registrar ponto' })
    } finally {
      setLoading(false)
    }
  }

  const nextPunch = getNextPunch()
  const isCompleto = nextPunch === 'completo'

  const formatPunchTime = (time: string | null) => {
    if (!time) return '--:--'
    return new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const getPunchCardStyle = (hasValue: boolean, isNext: boolean, color: string) => {
    if (hasValue) return `bg-${color}-50 border-${color}-200`
    if (isNext) return 'bg-blue-50 border-blue-300 border-dashed'
    return 'bg-slate-50 border-slate-200'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Main Clock Card */}
      <Card variant="gradient" className="overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-white/5 rounded-full"></div>

        <CardContent className="relative pt-8 pb-10">
          <div className="text-center">
            <p className="text-blue-100 mb-2">
              {currentTime && `${getDayOfWeek(currentTime)}, ${currentTime.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}`}
            </p>
            <p className="text-7xl md:text-8xl font-bold text-white font-mono tracking-tight">
              {currentTime ? formatTime(currentTime) : '--:--'}
            </p>
            <p className="text-blue-100 mt-4 text-lg">
              Proxima batida: <span className="font-semibold text-white">{getPunchTypeLabel(nextPunch)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Punch Button */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="text-center space-y-4">
            <Button
              size="xl"
              variant={isCompleto ? 'success' : 'primary'}
              className="w-full h-20 text-xl"
              onClick={handleBaterPonto}
              disabled={loading || isCompleto}
              loading={loading}
              icon={isCompleto ? <CheckIcon /> : <ClockIcon />}
            >
              {loading ? 'Registrando...' : isCompleto ? 'Dia Completo' : 'BATER PONTO'}
            </Button>

            {message && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <SuccessIcon className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                )}
                {message.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Record */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle icon={<ClockIcon className="w-6 h-6 text-blue-600" />}>Registro de Hoje</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            icon={<EditIcon />}
          >
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Entrada */}
            <PunchCard
              label="Entrada"
              time={formatPunchTime(todayPunch?.entrada ?? null)}
              hasValue={!!todayPunch?.entrada}
              isNext={nextPunch === 'entrada'}
              color="emerald"
            />

            {/* Saida Almoco */}
            <PunchCard
              label="Saida Almoco"
              time={formatPunchTime(todayPunch?.saidaAlmoco ?? null)}
              hasValue={!!todayPunch?.saidaAlmoco}
              isNext={nextPunch === 'saidaAlmoco'}
              color="amber"
            />

            {/* Volta Almoco */}
            <PunchCard
              label="Volta Almoco"
              time={formatPunchTime(todayPunch?.voltaAlmoco ?? null)}
              hasValue={!!todayPunch?.voltaAlmoco}
              isNext={nextPunch === 'voltaAlmoco'}
              color="amber"
            />

            {/* Saida */}
            <PunchCard
              label="Saida"
              time={formatPunchTime(todayPunch?.saida ?? null)}
              hasValue={!!todayPunch?.saida}
              isNext={nextPunch === 'saida'}
              color="red"
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <PunchEditor
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentPunch={todayPunch}
        onSave={fetchTodayPunch}
      />
    </div>
  )
}

interface PunchCardProps {
  label: string
  time: string
  hasValue: boolean
  isNext: boolean
  color: 'emerald' | 'amber' | 'red'
}

function PunchCard({ label, time, hasValue, isNext, color }: PunchCardProps) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', check: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', check: 'bg-amber-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', check: 'bg-red-500' }
  }

  const colors = colorMap[color]

  return (
    <div
      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
        hasValue
          ? `${colors.bg} ${colors.border}`
          : isNext
            ? 'bg-blue-50 border-blue-300 border-dashed'
            : 'bg-slate-50 border-slate-200'
      }`}
    >
      {isNext && !hasValue && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        {hasValue && (
          <span className={`w-6 h-6 ${colors.check} rounded-full flex items-center justify-center text-white`}>
            <CheckIcon />
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold ${hasValue ? 'text-slate-800' : 'text-slate-400'}`}>
        {time}
      </p>
    </div>
  )
}
