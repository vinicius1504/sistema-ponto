'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClockIcon, UserIcon, CheckIcon, ChevronRightIcon, SuccessIcon } from '@/components/icons'
import { useCurrentTime } from '@/hooks'
import { authService, pontoService } from '@/services/api'
import { formatTime, getDayOfWeek, getPunchTypeLabel } from '@/lib/utils'
import type { User, TodayPunch, PunchType } from '@/types'

export default function DashboardPage() {
  const currentTime = useCurrentTime()
  const [user, setUser] = useState<User | null>(null)
  const [todayPunch, setTodayPunch] = useState<TodayPunch | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      const data = await authService.getMe()
      setUser(data.user)
    } catch (error) {
      console.error('Erro ao buscar usuario:', error)
    }
  }, [])

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
    fetchUser()
    fetchTodayPunch()
  }, [fetchUser, fetchTodayPunch])

  const getNextPunch = (): PunchType => {
    if (!todayPunch) return 'entrada'
    if (!todayPunch.entrada) return 'entrada'
    if (!todayPunch.saidaAlmoco) return 'saidaAlmoco'
    if (!todayPunch.voltaAlmoco) return 'voltaAlmoco'
    if (!todayPunch.saida) return 'saida'
    return 'completo'
  }

  const getCompletedSteps = () => {
    let steps = 0
    if (todayPunch?.entrada) steps++
    if (todayPunch?.saidaAlmoco) steps++
    if (todayPunch?.voltaAlmoco) steps++
    if (todayPunch?.saida) steps++
    return steps
  }

  const nextPunch = getNextPunch()
  const completedSteps = getCompletedSteps()
  const progress = (completedSteps / 4) * 100

  const formatPunchTime = (time: string | null) => {
    if (!time) return '--:--'
    // Extrair apenas HH:MM da string ISO sem conversão de fuso horário
    const match = time.match(/T(\d{2}:\d{2})/)
    if (match) return match[1]
    // Fallback para strings que já são apenas hora
    if (/^\d{2}:\d{2}/.test(time)) return time.slice(0, 5)
    return '--:--'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card variant="gradient" className="overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <CardContent className="relative pt-6 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Bem-vindo de volta</p>
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.nome || 'Carregando...'}
              </h1>
              <p className="text-blue-100">
                {user?.cargo} - {user?.departamento}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-6xl font-bold text-white/90 font-mono">
                {currentTime ? formatTime(currentTime) : '--:--'}
              </p>
              <p className="text-blue-100 mt-2">
                {currentTime && `${getDayOfWeek(currentTime)}, ${currentTime.toLocaleDateString('pt-BR')}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status do Dia */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle icon={<ClockIcon />}>Registro de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Progresso do dia</span>
                <span className="font-semibold text-slate-800">{completedSteps}/4 batidas</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Time Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TimeCard
                label="Entrada"
                time={formatPunchTime(todayPunch?.entrada ?? null)}
                hasValue={!!todayPunch?.entrada}
                isNext={nextPunch === 'entrada'}
                color="emerald"
              />
              <TimeCard
                label="Saida Almoco"
                time={formatPunchTime(todayPunch?.saidaAlmoco ?? null)}
                hasValue={!!todayPunch?.saidaAlmoco}
                isNext={nextPunch === 'saidaAlmoco'}
                color="amber"
              />
              <TimeCard
                label="Volta Almoco"
                time={formatPunchTime(todayPunch?.voltaAlmoco ?? null)}
                hasValue={!!todayPunch?.voltaAlmoco}
                isNext={nextPunch === 'voltaAlmoco'}
                color="amber"
              />
              <TimeCard
                label="Saida"
                time={formatPunchTime(todayPunch?.saida ?? null)}
                hasValue={!!todayPunch?.saida}
                isNext={nextPunch === 'saida'}
                color="red"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Next Punch Card */}
          <Card hover>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  nextPunch === 'completo'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {nextPunch === 'completo' ? (
                    <SuccessIcon className="w-8 h-8" />
                  ) : (
                    <ClockIcon className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {nextPunch === 'completo' ? 'Dia Completo!' : 'Proxima Batida'}
                </h3>
                <p className={`text-2xl font-bold mb-4 ${
                  nextPunch === 'completo' ? 'text-emerald-600' : 'text-blue-600'
                }`}>
                  {getPunchTypeLabel(nextPunch)}
                </p>
                {nextPunch !== 'completo' && (
                  <Link href="/ponto">
                    <Button className="w-full" size="lg">
                      Bater Ponto
                      <ChevronRightIcon />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle icon={<UserIcon />}>Seus Dados</CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="space-y-3">
                  <InfoRow label="Codigo" value={user.codigoFuncionario} />
                  <InfoRow label="Cargo" value={user.cargo} />
                  <InfoRow label="Departamento" value={user.departamento} />
                  <InfoRow label="Empresa" value={user.empresa.nome} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface TimeCardProps {
  label: string
  time: string
  hasValue: boolean
  isNext: boolean
  color: 'emerald' | 'amber' | 'red'
}

function TimeCard({ label, time, hasValue, isNext, color }: TimeCardProps) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', check: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', check: 'bg-amber-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', check: 'bg-red-500' }
  }

  const colors = colorMap[color]

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      hasValue
        ? `${colors.bg} ${colors.border}`
        : isNext
          ? 'bg-blue-50 border-blue-300 border-dashed'
          : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase">{label}</span>
        {hasValue && (
          <span className={`w-5 h-5 ${colors.check} rounded-full flex items-center justify-center text-white`}>
            <CheckIcon />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">{time}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  )
}
