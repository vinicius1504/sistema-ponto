'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
      console.error('Erro ao buscar usuário:', error)
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="space-y-2">
                <p className="text-lg font-medium">{user.nome}</p>
                <p className="text-sm text-gray-500">{user.cargo}</p>
                <p className="text-sm text-gray-500">{user.departamento}</p>
                <p className="text-sm text-gray-500">{user.empresa.nome}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Horário */}
        <Card>
          <CardHeader>
            <CardTitle>Horário Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">
                {formatTime(currentTime)}
              </p>
              <p className="text-gray-500 mt-2">
                {getDayOfWeek(currentTime)},{' '}
                {currentTime.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Próxima Batida */}
        <Card>
          <CardHeader>
            <CardTitle>Próxima Batida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {getPunchTypeLabel(getNextPunch())}
              </p>
              <p className="text-gray-500 mt-2">
                {getNextPunch() === 'completo'
                  ? 'Dia completo!'
                  : 'Aguardando batida'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registro do Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Entrada</p>
              <p className="text-xl font-semibold">
                {todayPunch?.entrada
                  ? new Date(todayPunch.entrada).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Saída Almoço</p>
              <p className="text-xl font-semibold">
                {todayPunch?.saidaAlmoco
                  ? new Date(todayPunch.saidaAlmoco).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Volta Almoço</p>
              <p className="text-xl font-semibold">
                {todayPunch?.voltaAlmoco
                  ? new Date(todayPunch.voltaAlmoco).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Saída</p>
              <p className="text-xl font-semibold">
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
