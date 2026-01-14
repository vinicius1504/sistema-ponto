'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClockIcon, CheckIcon, ErrorIcon } from '@/components/icons'
import { authService } from '@/services/api'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authService.login(formData.email, formData.senha)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <ClockIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Sistema de Ponto
          </h1>
          <p className="text-blue-100 text-lg text-center max-w-md">
            Gerencie seus registros de ponto de forma simples e eficiente.
          </p>

          {/* Features List */}
          <div className="mt-12 space-y-4">
            <FeatureItem text="Registro de ponto facil e rapido" />
            <FeatureItem text="Relatorios completos em PDF" />
            <FeatureItem text="Gestao de funcionarios" />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Sistema de Ponto</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
              <p className="text-slate-500 mt-2">Entre com suas credenciais para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3">
                  <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                id="senha"
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={(e) =>
                  setFormData({ ...formData, senha: e.target.value })
                }
                required
              />

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Ainda nao tem conta?{' '}
                <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Registre-se
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} Sistema de Ponto. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 text-white/90">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
        <CheckIcon className="w-5 h-5" />
      </div>
      <span>{text}</span>
    </div>
  )
}
