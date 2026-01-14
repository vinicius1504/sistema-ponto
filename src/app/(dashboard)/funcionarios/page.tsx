'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Funcionario {
  id: string
  nome: string
  email: string
  codigoFuncionario: string
  cargo: string
  codigoCargo: string
  departamento: string
  codigoDepartamento: string
  ctps: string
  ctpsSerie: string
  pis: string
  isAdmin: boolean
}

const UsersIcon = ({ className = "w-6 h-6 text-blue-600" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    codigoFuncionario: '',
    cargo: '',
    codigoCargo: '',
    departamento: '',
    codigoDepartamento: '',
    ctps: '',
    ctpsSerie: '',
    pis: '',
    isAdmin: false
  })

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios')
      if (response.ok) {
        const data = await response.json()
        setFuncionarios(data.funcionarios)
      }
    } catch (error) {
      console.error('Erro ao buscar funcionarios:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/funcionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      setSuccess('Funcionario cadastrado com sucesso!')
      setShowForm(false)
      setFormData({
        email: '',
        senha: '',
        nome: '',
        codigoFuncionario: '',
        cargo: '',
        codigoCargo: '',
        departamento: '',
        codigoDepartamento: '',
        ctps: '',
        ctpsSerie: '',
        pis: '',
        isAdmin: false
      })
      fetchFuncionarios()
    } catch {
      setError('Erro ao cadastrar funcionario')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Funcionarios</h1>
        <Button onClick={() => setShowForm(!showForm)} icon={showForm ? undefined : <PlusIcon />}>
          {showForm ? 'Cancelar' : 'Novo Funcionario'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Funcionario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
                <Input
                  id="senha"
                  label="Senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => updateField('senha', e.target.value)}
                  required
                />
                <Input
                  id="nome"
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  required
                />
                <Input
                  id="codigoFuncionario"
                  label="Codigo Funcionario"
                  value={formData.codigoFuncionario}
                  onChange={(e) => updateField('codigoFuncionario', e.target.value)}
                  required
                />
                <Input
                  id="cargo"
                  label="Cargo"
                  value={formData.cargo}
                  onChange={(e) => updateField('cargo', e.target.value)}
                  required
                />
                <Input
                  id="codigoCargo"
                  label="Codigo Cargo"
                  value={formData.codigoCargo}
                  onChange={(e) => updateField('codigoCargo', e.target.value)}
                  required
                />
                <Input
                  id="departamento"
                  label="Departamento"
                  value={formData.departamento}
                  onChange={(e) => updateField('departamento', e.target.value)}
                  required
                />
                <Input
                  id="codigoDepartamento"
                  label="Codigo Departamento"
                  value={formData.codigoDepartamento}
                  onChange={(e) => updateField('codigoDepartamento', e.target.value)}
                  required
                />
                <Input
                  id="ctps"
                  label="CTPS"
                  value={formData.ctps}
                  onChange={(e) => updateField('ctps', e.target.value)}
                  required
                />
                <Input
                  id="ctpsSerie"
                  label="Serie CTPS"
                  value={formData.ctpsSerie}
                  onChange={(e) => updateField('ctpsSerie', e.target.value)}
                  required
                />
                <Input
                  id="pis"
                  label="PIS"
                  value={formData.pis}
                  onChange={(e) => updateField('pis', e.target.value)}
                  required
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={formData.isAdmin}
                    onChange={(e) => updateField('isAdmin', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700">
                    Administrador
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={loading} loading={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Funcionarios */}
      <Card>
        <CardHeader>
          <CardTitle icon={<UsersIcon />}>Lista de Funcionarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Codigo</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Nome</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Cargo</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Departamento</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Admin</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((func) => (
                  <tr key={func.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-slate-600">{func.codigoFuncionario}</td>
                    <td className="py-3 px-2 text-slate-900 font-medium">{func.nome}</td>
                    <td className="py-3 px-2 text-slate-600">
                      {func.codigoCargo} - {func.cargo}
                    </td>
                    <td className="py-3 px-2 text-slate-600">
                      {func.codigoDepartamento} - {func.departamento}
                    </td>
                    <td className="py-3 px-2 text-slate-600">{func.email}</td>
                    <td className="py-3 px-2">
                      {func.isAdmin ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Sim
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          Nao
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {funcionarios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <UsersIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      Nenhum funcionario cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
