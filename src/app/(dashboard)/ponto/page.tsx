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
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 text-center">Bater Ponto</h1>

      {/* Relógio */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-6xl font-bold text-blue-600 font-mono">
              {formatTime(currentTime)}
            </p>
            <p className="text-xl text-gray-500 mt-4">
              {getDayOfWeek(currentTime)},{' '}
              {currentTime.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Bater Ponto */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600">
              Próxima batida:{' '}
              <span className="font-bold text-blue-600">
                {getPunchTypeLabel(nextPunch)}
              </span>
            </p>

            <Button
              size="lg"
              className="w-full h-20 text-2xl"
              onClick={handleBaterPonto}
              disabled={loading || isCompleto}
            >
              {loading ? 'Registrando...' : isCompleto ? 'Dia Completo' : 'BATER PONTO'}
            </Button>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registro do Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`text-center p-4 rounded-lg ${
                todayPunch?.entrada ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Entrada</p>
              <p className="text-2xl font-semibold">
                {todayPunch?.entrada
                  ? new Date(todayPunch.entrada).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                todayPunch?.saidaAlmoco ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Saída Almoço</p>
              <p className="text-2xl font-semibold">
                {todayPunch?.saidaAlmoco
                  ? new Date(todayPunch.saidaAlmoco).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                todayPunch?.voltaAlmoco ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Volta Almoço</p>
              <p className="text-2xl font-semibold">
                {todayPunch?.voltaAlmoco
                  ? new Date(todayPunch.voltaAlmoco).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                todayPunch?.saida ? 'bg-red-50' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Saída</p>
              <p className="text-2xl font-semibold">
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
    </div>
  )
}
