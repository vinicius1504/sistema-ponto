'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatTime, getDayOfWeek, getPunchTypeLabel } from '@/lib/utils'

interface TodayPunch {
  entrada: string | null
  saidaAlmoco: string | null
  voltaAlmoco: string | null
  saida: string | null
}

const ClockIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function PontoPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayPunch, setTodayPunch] = useState<TodayPunch | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchTodayPunch()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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

  const handleBaterPonto = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/ponto/bater', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }

      setMessage({ type: 'success', text: data.mensagem })
      fetchTodayPunch()
    } catch {
      setMessage({ type: 'error', text: 'Erro ao registrar ponto' })
    } finally {
      setLoading(false)
    }
  }

  const nextPunch = getNextPunch()
  const isCompleto = nextPunch === 'completo'

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
              {getDayOfWeek(currentTime)}, {currentTime.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-7xl md:text-8xl font-bold text-white font-mono tracking-tight">
              {formatTime(currentTime)}
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
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Record */}
      <Card>
        <CardHeader>
          <CardTitle icon={<ClockIcon className="w-6 h-6 text-blue-600" />}>Registro de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Entrada */}
            <div
              className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                todayPunch?.entrada
                  ? 'bg-emerald-50 border-emerald-200'
                  : nextPunch === 'entrada'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}
            >
              {nextPunch === 'entrada' && !todayPunch?.entrada && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entrada</span>
                {todayPunch?.entrada && (
                  <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CheckIcon />
                  </span>
                )}
              </div>
              <p className={`text-3xl font-bold ${todayPunch?.entrada ? 'text-slate-800' : 'text-slate-400'}`}>
                {todayPunch?.entrada
                  ? new Date(todayPunch.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>

            {/* Saida Almoco */}
            <div
              className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                todayPunch?.saidaAlmoco
                  ? 'bg-amber-50 border-amber-200'
                  : nextPunch === 'saidaAlmoco'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}
            >
              {nextPunch === 'saidaAlmoco' && !todayPunch?.saidaAlmoco && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saida Almoco</span>
                {todayPunch?.saidaAlmoco && (
                  <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white">
                    <CheckIcon />
                  </span>
                )}
              </div>
              <p className={`text-3xl font-bold ${todayPunch?.saidaAlmoco ? 'text-slate-800' : 'text-slate-400'}`}>
                {todayPunch?.saidaAlmoco
                  ? new Date(todayPunch.saidaAlmoco).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>

            {/* Volta Almoco */}
            <div
              className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                todayPunch?.voltaAlmoco
                  ? 'bg-amber-50 border-amber-200'
                  : nextPunch === 'voltaAlmoco'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}
            >
              {nextPunch === 'voltaAlmoco' && !todayPunch?.voltaAlmoco && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Volta Almoco</span>
                {todayPunch?.voltaAlmoco && (
                  <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white">
                    <CheckIcon />
                  </span>
                )}
              </div>
              <p className={`text-3xl font-bold ${todayPunch?.voltaAlmoco ? 'text-slate-800' : 'text-slate-400'}`}>
                {todayPunch?.voltaAlmoco
                  ? new Date(todayPunch.voltaAlmoco).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>

            {/* Saida */}
            <div
              className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                todayPunch?.saida
                  ? 'bg-red-50 border-red-200'
                  : nextPunch === 'saida'
                    ? 'bg-blue-50 border-blue-300 border-dashed'
                    : 'bg-slate-50 border-slate-200'
              }`}
            >
              {nextPunch === 'saida' && !todayPunch?.saida && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saida</span>
                {todayPunch?.saida && (
                  <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <CheckIcon />
                  </span>
                )}
              </div>
              <p className={`text-3xl font-bold ${todayPunch?.saida ? 'text-slate-800' : 'text-slate-400'}`}>
                {todayPunch?.saida
                  ? new Date(todayPunch.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
