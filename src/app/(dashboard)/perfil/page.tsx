'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserIcon, EditIcon, ErrorIcon, SuccessIcon, BuildingIcon, IdCardIcon, BriefcaseIcon } from '@/components/icons'
import { authService, funcionariosService } from '@/services/api'
import type { FuncionarioCompleto, UpdateFuncionarioData } from '@/types'

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<FuncionarioCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<UpdateFuncionarioData>({})

  const fetchUsuario = useCallback(async () => {
    try {
      const { user } = await authService.getMe()
      const { funcionario } = await funcionariosService.getById(user.id)
      setUsuario(funcionario)
      setFormData({
        nome: funcionario.nome,
        email: funcionario.email,
        codigoFuncionario: funcionario.codigoFuncionario,
        cargo: funcionario.cargo,
        codigoCargo: funcionario.codigoCargo,
        departamento: funcionario.departamento,
        codigoDepartamento: funcionario.codigoDepartamento,
        ctps: funcionario.ctps,
        ctpsSerie: funcionario.ctpsSerie,
        pis: funcionario.pis,
        empresaNomeCustom: funcionario.empresaNomeCustom,
        empresaCnpjCustom: funcionario.empresaCnpjCustom,
        empresaEnderecoCustom: funcionario.empresaEnderecoCustom,
        empresaAtividadeCustom: funcionario.empresaAtividadeCustom,
        empresaServicoCustom: funcionario.empresaServicoCustom
      })
    } catch (error) {
      console.error('Erro ao buscar usuario:', error)
      setError('Erro ao carregar dados do usuario')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsuario()
  }, [fetchUsuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { funcionario } = await funcionariosService.update(usuario.id, formData)
      setUsuario(funcionario)
      setSuccess('Dados atualizados com sucesso!')
      setEditMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof UpdateFuncionarioData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const cancelEdit = () => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        codigoFuncionario: usuario.codigoFuncionario,
        cargo: usuario.cargo,
        codigoCargo: usuario.codigoCargo,
        departamento: usuario.departamento,
        codigoDepartamento: usuario.codigoDepartamento,
        ctps: usuario.ctps,
        ctpsSerie: usuario.ctpsSerie,
        pis: usuario.pis,
        empresaNomeCustom: usuario.empresaNomeCustom,
        empresaCnpjCustom: usuario.empresaCnpjCustom,
        empresaEnderecoCustom: usuario.empresaEnderecoCustom,
        empresaAtividadeCustom: usuario.empresaAtividadeCustom,
        empresaServicoCustom: usuario.empresaServicoCustom
      })
    }
    setEditMode(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ErrorIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-500">Erro ao carregar dados do usuario</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        {!editMode && (
          <Button onClick={() => setEditMode(true)} icon={<EditIcon />} variant="secondary">
            Editar Dados
          </Button>
        )}
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

      {/* Header do Perfil */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
              {usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{usuario.nome}</h2>
              <p className="text-slate-500">{usuario.cargo}</p>
              <div className="flex items-center gap-2 mt-1">
                {usuario.isAdmin && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Administrador
                  </span>
                )}
                <span className="text-slate-400 text-sm">#{usuario.codigoFuncionario}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {editMode ? (
        /* Formulario de Edicao */
        <Card>
          <CardHeader>
            <CardTitle icon={<EditIcon />}>Editar Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="nome"
                    label="Nome Completo"
                    value={formData.nome || ''}
                    onChange={(e) => updateField('nome', e.target.value)}
                    required
                  />
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                  <Input
                    id="senha"
                    label="Nova Senha (deixe em branco para manter)"
                    type="password"
                    value={formData.senha || ''}
                    onChange={(e) => updateField('senha', e.target.value)}
                  />
                </div>
              </div>

              {/* Dados Profissionais */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4" />
                  Dados Profissionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="codigoFuncionario"
                    label="Codigo Funcionario"
                    value={formData.codigoFuncionario || ''}
                    onChange={(e) => updateField('codigoFuncionario', e.target.value)}
                    required
                  />
                  <Input
                    id="cargo"
                    label="Cargo"
                    value={formData.cargo || ''}
                    onChange={(e) => updateField('cargo', e.target.value)}
                    required
                  />
                  <Input
                    id="codigoCargo"
                    label="Codigo Cargo"
                    value={formData.codigoCargo || ''}
                    onChange={(e) => updateField('codigoCargo', e.target.value)}
                    required
                  />
                  <Input
                    id="departamento"
                    label="Departamento"
                    value={formData.departamento || ''}
                    onChange={(e) => updateField('departamento', e.target.value)}
                    required
                  />
                  <Input
                    id="codigoDepartamento"
                    label="Codigo Departamento"
                    value={formData.codigoDepartamento || ''}
                    onChange={(e) => updateField('codigoDepartamento', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <IdCardIcon className="w-4 h-4" />
                  Documentos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    id="ctps"
                    label="CTPS"
                    value={formData.ctps || ''}
                    onChange={(e) => updateField('ctps', e.target.value)}
                    required
                  />
                  <Input
                    id="ctpsSerie"
                    label="Serie CTPS"
                    value={formData.ctpsSerie || ''}
                    onChange={(e) => updateField('ctpsSerie', e.target.value)}
                    required
                  />
                  <Input
                    id="pis"
                    label="PIS"
                    value={formData.pis || ''}
                    onChange={(e) => updateField('pis', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Dados da Empresa (Custom) */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4" />
                  Dados da Empresa (Cabecalho da Folha de Ponto)
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Deixe em branco para usar os dados padrao da empresa
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="empresaNomeCustom"
                    label="Nome da Empresa"
                    value={formData.empresaNomeCustom || ''}
                    onChange={(e) => updateField('empresaNomeCustom', e.target.value)}
                    placeholder={usuario.empresa?.nome || ''}
                  />
                  <Input
                    id="empresaCnpjCustom"
                    label="CNPJ"
                    value={formData.empresaCnpjCustom || ''}
                    onChange={(e) => updateField('empresaCnpjCustom', e.target.value)}
                    placeholder={usuario.empresa?.cnpj || ''}
                  />
                  <Input
                    id="empresaAtividadeCustom"
                    label="Atividade"
                    value={formData.empresaAtividadeCustom || ''}
                    onChange={(e) => updateField('empresaAtividadeCustom', e.target.value)}
                    placeholder={usuario.empresa?.atividade || ''}
                  />
                  <Input
                    id="empresaServicoCustom"
                    label="Servico"
                    value={formData.empresaServicoCustom || ''}
                    onChange={(e) => updateField('empresaServicoCustom', e.target.value)}
                    placeholder={usuario.empresa?.servico || ''}
                  />
                  <div className="md:col-span-2">
                    <Input
                      id="empresaEnderecoCustom"
                      label="Endereco"
                      value={formData.empresaEnderecoCustom || ''}
                      onChange={(e) => updateField('empresaEnderecoCustom', e.target.value)}
                      placeholder={usuario.empresa?.endereco || ''}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button type="submit" disabled={saving} loading={saving}>
                  {saving ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelEdit} disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Visualizacao dos Dados */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle icon={<BriefcaseIcon />}>Dados Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Codigo</span>
                  <span className="font-medium text-slate-800">{usuario.codigoFuncionario}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Cargo</span>
                  <span className="font-medium text-slate-800">{usuario.codigoCargo} - {usuario.cargo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Departamento</span>
                  <span className="font-medium text-slate-800">{usuario.codigoDepartamento} - {usuario.departamento}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800">{usuario.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle icon={<IdCardIcon />}>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">CTPS</span>
                  <span className="font-medium text-slate-800">{usuario.ctps}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Serie CTPS</span>
                  <span className="font-medium text-slate-800">{usuario.ctpsSerie}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">PIS</span>
                  <span className="font-medium text-slate-800">{usuario.pis}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empresa */}
          {usuario.empresa && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle icon={<BuildingIcon />}>Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Nome</span>
                    <span className="font-medium text-slate-800">{usuario.empresa.nome}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">CNPJ</span>
                    <span className="font-medium text-slate-800">{usuario.empresa.cnpj}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Atividade</span>
                    <span className="font-medium text-slate-800">{usuario.empresa.atividade}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Servico</span>
                    <span className="font-medium text-slate-800">{usuario.empresa.servico || '-'}</span>
                  </div>
                  <div className="md:col-span-2 flex justify-between py-2">
                    <span className="text-slate-500">Endereco</span>
                    <span className="font-medium text-slate-800">{usuario.empresa.endereco}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
