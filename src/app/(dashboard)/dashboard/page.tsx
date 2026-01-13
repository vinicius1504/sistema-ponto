'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatTime, getDayOfWeek, getPunchTypeLabel } from '@/lib/utils'

interface User {
  id: string
  nome: string
  email: string
  codigoFuncionario: string
  cargo: string
  departamento: string
  empresa: {
    nome: string
  }
}

interface TodayPunch {
  entrada: string | null
  saidaAlmoco: string | null
  voltaAlmoco: string | null
  saida: string | null
}

const ClockIcon = ({ className = "w-6 h-6 text-blue-600" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserIcon = ({ className = "w-6 h-6 text-blue-600" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [todayPunch, setTodayPunch] = useState<TodayPunch | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchUser()
    fetchTodayPunch()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Erro ao buscar usuario:', error)
    }
  }

  const fetchTodayPunch = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/ponto?data=${today}`)
      if (response.ok) {
        const data = await response.json()
        setTodayPunch(data.registro)
      }
    } catch (error) {
      console.error('Erro ao buscar ponto:', error)
    }
  }

  const getNextPunch = () => {
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
                {formatTime(currentTime)}
              </p>
              <p className="text-blue-100 mt-2">
                {getDayOfWeek(currentTime)}, {currentTime.toLocaleDateString('pt-BR')}
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
              <div className={`p-4 rounded-xl border-2 transition-all ${
                todayPunch?.entrada
                  ? 'bg-emerald-50 border-emerald-200'
                  : nextPunch === 'entrada'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">Entrada</span>
                  {todayPunch?.entrada && (
                    <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <CheckIcon />
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {todayPunch?.entrada
                    ? new Date(todayPunch.entrada).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '--:--'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all ${
                todayPunch?.saidaAlmoco
                  ? 'bg-amber-50 border-amber-200'
                  : nextPunch === 'saidaAlmoco'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">Saida Almoco</span>
                  {todayPunch?.saidaAlmoco && (
                    <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white">
                      <CheckIcon />
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {todayPunch?.saidaAlmoco
                    ? new Date(todayPunch.saidaAlmoco).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '--:--'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all ${
                todayPunch?.voltaAlmoco
                  ? 'bg-amber-50 border-amber-200'
                  : nextPunch === 'voltaAlmoco'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">Volta Almoco</span>
                  {todayPunch?.voltaAlmoco && (
                    <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white">
                      <CheckIcon />
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {todayPunch?.voltaAlmoco
                    ? new Date(todayPunch.voltaAlmoco).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '--:--'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all ${
                todayPunch?.saida
                  ? 'bg-red-50 border-red-200'
                  : nextPunch === 'saida'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">Saida</span>
                  {todayPunch?.saida && (
                    <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <CheckIcon />
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {todayPunch?.saida
                    ? new Date(todayPunch.saida).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '--:--'}
                </p>
              </div>
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
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <ClockIcon />
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
                      <ArrowRightIcon />
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
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Codigo</span>
                    <span className="font-medium text-slate-800">{user.codigoFuncionario}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Cargo</span>
                    <span className="font-medium text-slate-800">{user.cargo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Departamento</span>
                    <span className="font-medium text-slate-800">{user.departamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Empresa</span>
                    <span className="font-medium text-slate-800">{user.empresa.nome}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
