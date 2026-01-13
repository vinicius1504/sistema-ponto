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
      console.error('Erro ao buscar funcionários:', error)
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

      setSuccess('Funcionário cadastrado com sucesso!')
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
      setError('Erro ao cadastrar funcionário')
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
        <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Novo Funcionário'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
          {success}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Funcionário</CardTitle>
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
                  label="Código Funcionário"
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
                  label="Código Cargo"
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
                  label="Código Departamento"
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
                  label="Série CTPS"
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={formData.isAdmin}
                    onChange={(e) => updateField('isAdmin', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isAdmin" className="text-sm text-gray-700">
                    Administrador
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Funcionários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Código</th>
                  <th className="text-left py-3 px-2">Nome</th>
                  <th className="text-left py-3 px-2">Cargo</th>
                  <th className="text-left py-3 px-2">Departamento</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Admin</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((func) => (
                  <tr key={func.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">{func.codigoFuncionario}</td>
                    <td className="py-3 px-2">{func.nome}</td>
                    <td className="py-3 px-2">
                      {func.codigoCargo} - {func.cargo}
                    </td>
                    <td className="py-3 px-2">
                      {func.codigoDepartamento} - {func.departamento}
                    </td>
                    <td className="py-3 px-2">{func.email}</td>
                    <td className="py-3 px-2">
                      {func.isAdmin ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          Sim
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Não
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {funcionarios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Nenhum funcionário cadastrado
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
