'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    // Dados da empresa
    empresaNome: '',
    empresaCnpj: '',
    empresaEndereco: '',
    empresaAtividade: '',
    empresaServico: '',
    // Dados do funcionário
    email: '',
    senha: '',
    confirmarSenha: '',
    nome: '',
    codigoFuncionario: '',
    cargo: '',
    codigoCargo: '',
    departamento: '',
    codigoDepartamento: '',
    ctps: '',
    ctpsSerie: '',
    pis: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      setStep(2)
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao registrar')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <p className="text-gray-500 mt-2">
            {step === 1 ? 'Dados da Empresa' : 'Dados do Funcionário'}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <Input
                  id="empresaNome"
                  label="Nome da Empresa"
                  placeholder="MILLIONTECH"
                  value={formData.empresaNome}
                  onChange={(e) => updateField('empresaNome', e.target.value)}
                  required
                />

                <Input
                  id="empresaCnpj"
                  label="CNPJ/CPF"
                  placeholder="00.000.000/0000-00"
                  value={formData.empresaCnpj}
                  onChange={(e) => updateField('empresaCnpj', e.target.value)}
                  required
                />

                <Input
                  id="empresaEndereco"
                  label="Endereço"
                  placeholder="Rua, Número"
                  value={formData.empresaEndereco}
                  onChange={(e) => updateField('empresaEndereco', e.target.value)}
                  required
                />

                <Input
                  id="empresaAtividade"
                  label="Atividade"
                  placeholder="Securitização de créditos"
                  value={formData.empresaAtividade}
                  onChange={(e) => updateField('empresaAtividade', e.target.value)}
                  required
                />

                <Input
                  id="empresaServico"
                  label="Serviço"
                  placeholder="Nome do serviço (opcional)"
                  value={formData.empresaServico}
                  onChange={(e) => updateField('empresaServico', e.target.value)}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />

                  <Input
                    id="nome"
                    label="Nome Completo"
                    placeholder="VINICIUS GABRIEL BENITES LEITE"
                    value={formData.nome}
                    onChange={(e) => updateField('nome', e.target.value)}
                    required
                  />

                  <Input
                    id="senha"
                    label="Senha"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.senha}
                    onChange={(e) => updateField('senha', e.target.value)}
                    required
                  />

                  <Input
                    id="confirmarSenha"
                    label="Confirmar Senha"
                    type="password"
                    placeholder="Confirme a senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => updateField('confirmarSenha', e.target.value)}
                    required
                  />

                  <Input
                    id="codigoFuncionario"
                    label="Código Funcionário"
                    placeholder="014"
                    value={formData.codigoFuncionario}
                    onChange={(e) => updateField('codigoFuncionario', e.target.value)}
                    required
                  />

                  <Input
                    id="cargo"
                    label="Cargo"
                    placeholder="DESENVOLVEDOR JUNIOR 1"
                    value={formData.cargo}
                    onChange={(e) => updateField('cargo', e.target.value)}
                    required
                  />

                  <Input
                    id="codigoCargo"
                    label="Código Cargo"
                    placeholder="012"
                    value={formData.codigoCargo}
                    onChange={(e) => updateField('codigoCargo', e.target.value)}
                    required
                  />

                  <Input
                    id="departamento"
                    label="Departamento"
                    placeholder="SUPORTE"
                    value={formData.departamento}
                    onChange={(e) => updateField('departamento', e.target.value)}
                    required
                  />

                  <Input
                    id="codigoDepartamento"
                    label="Código Departamento"
                    placeholder="001"
                    value={formData.codigoDepartamento}
                    onChange={(e) => updateField('codigoDepartamento', e.target.value)}
                    required
                  />

                  <Input
                    id="ctps"
                    label="CTPS"
                    placeholder="0560702"
                    value={formData.ctps}
                    onChange={(e) => updateField('ctps', e.target.value)}
                    required
                  />

                  <Input
                    id="ctpsSerie"
                    label="Série CTPS"
                    placeholder="9140"
                    value={formData.ctpsSerie}
                    onChange={(e) => updateField('ctpsSerie', e.target.value)}
                    required
                  />

                  <Input
                    id="pis"
                    label="PIS"
                    placeholder="21314122861"
                    value={formData.pis}
                    onChange={(e) => updateField('pis', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Registrando...' : step === 1 ? 'Próximo' : 'Registrar'}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
