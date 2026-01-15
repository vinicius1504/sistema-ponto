'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { UsersIcon, PlusIcon, ErrorIcon, SuccessIcon, EditIcon } from '@/components/icons'
import { funcionariosService } from '@/services/api'
import type { FuncionarioCompleto, UpdateFuncionarioData } from '@/types'

const initialFormData = {
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
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<FuncionarioCompleto[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(initialFormData)

  // Estado para edicao
  const [editingFuncionario, setEditingFuncionario] = useState<FuncionarioCompleto | null>(null)
  const [editFormData, setEditFormData] = useState<UpdateFuncionarioData>({})
  const [editLoading, setEditLoading] = useState(false)

  const fetchFuncionarios = useCallback(async () => {
    try {
      const data = await funcionariosService.getAll()
      setFuncionarios(data.funcionarios)
    } catch (error) {
      console.error('Erro ao buscar funcionarios:', error)
    }
  }, [])

  const openEditModal = (func: FuncionarioCompleto) => {
    setEditingFuncionario(func)
    setEditFormData({
      nome: func.nome,
      email: func.email,
      codigoFuncionario: func.codigoFuncionario,
      cargo: func.cargo,
      codigoCargo: func.codigoCargo,
      departamento: func.departamento,
      codigoDepartamento: func.codigoDepartamento,
      ctps: func.ctps,
      ctpsSerie: func.ctpsSerie,
      pis: func.pis,
      isAdmin: func.isAdmin
    })
  }

  const closeEditModal = () => {
    setEditingFuncionario(null)
    setEditFormData({})
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFuncionario) return

    setEditLoading(true)
    setError('')
    setSuccess('')

    try {
      await funcionariosService.update(editingFuncionario.id, editFormData)
      setSuccess('Funcionario atualizado com sucesso!')
      closeEditModal()
      fetchFuncionarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar funcionario')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o funcionario ${nome}?`)) return

    setError('')
    setSuccess('')

    try {
      await funcionariosService.delete(id)
      setSuccess('Funcionario excluido com sucesso!')
      fetchFuncionarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir funcionario')
    }
  }

  const updateEditField = (field: keyof UpdateFuncionarioData, value: string | boolean) => {
    setEditFormData({ ...editFormData, [field]: value })
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [fetchFuncionarios])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await funcionariosService.create(formData as Parameters<typeof funcionariosService.create>[0])
      setSuccess('Funcionario cadastrado com sucesso!')
      setShowForm(false)
      setFormData(initialFormData)
      fetchFuncionarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar funcionario')
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
          <ErrorIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
          <SuccessIcon className="w-5 h-5 flex-shrink-0" />
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
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Acoes</th>
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
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(func)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(func.id, func.nome)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {funcionarios.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
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

      {/* Modal de Edicao */}
      <Modal
        isOpen={!!editingFuncionario}
        onClose={closeEditModal}
        className="max-w-2xl max-h-[90vh] overflow-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Editar Funcionario</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="edit-email"
                label="Email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => updateEditField('email', e.target.value)}
                required
              />
              <Input
                id="edit-senha"
                label="Nova Senha (deixe em branco para manter)"
                type="password"
                value={editFormData.senha || ''}
                onChange={(e) => updateEditField('senha', e.target.value)}
              />
              <Input
                id="edit-nome"
                label="Nome Completo"
                value={editFormData.nome || ''}
                onChange={(e) => updateEditField('nome', e.target.value)}
                required
              />
              <Input
                id="edit-codigoFuncionario"
                label="Codigo Funcionario"
                value={editFormData.codigoFuncionario || ''}
                onChange={(e) => updateEditField('codigoFuncionario', e.target.value)}
                required
              />
              <Input
                id="edit-cargo"
                label="Cargo"
                value={editFormData.cargo || ''}
                onChange={(e) => updateEditField('cargo', e.target.value)}
                required
              />
              <Input
                id="edit-codigoCargo"
                label="Codigo Cargo"
                value={editFormData.codigoCargo || ''}
                onChange={(e) => updateEditField('codigoCargo', e.target.value)}
                required
              />
              <Input
                id="edit-departamento"
                label="Departamento"
                value={editFormData.departamento || ''}
                onChange={(e) => updateEditField('departamento', e.target.value)}
                required
              />
              <Input
                id="edit-codigoDepartamento"
                label="Codigo Departamento"
                value={editFormData.codigoDepartamento || ''}
                onChange={(e) => updateEditField('codigoDepartamento', e.target.value)}
                required
              />
              <Input
                id="edit-ctps"
                label="CTPS"
                value={editFormData.ctps || ''}
                onChange={(e) => updateEditField('ctps', e.target.value)}
                required
              />
              <Input
                id="edit-ctpsSerie"
                label="Serie CTPS"
                value={editFormData.ctpsSerie || ''}
                onChange={(e) => updateEditField('ctpsSerie', e.target.value)}
                required
              />
              <Input
                id="edit-pis"
                label="PIS"
                value={editFormData.pis || ''}
                onChange={(e) => updateEditField('pis', e.target.value)}
                required
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-isAdmin"
                  checked={editFormData.isAdmin || false}
                  onChange={(e) => updateEditField('isAdmin', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="edit-isAdmin" className="text-sm font-medium text-slate-700">
                  Administrador
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" disabled={editLoading} loading={editLoading}>
                {editLoading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="secondary" onClick={closeEditModal} disabled={editLoading}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
