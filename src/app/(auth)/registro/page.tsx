'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorIcon, EyeIcon, EyeOffIcon } from '@/components/icons'
import { authService } from '@/services/api'

const initialFormData = {
  // Dados da empresa
  empresaNome: '',
  empresaCnpj: '',
  empresaEndereco: '',
  empresaAtividade: '',
  empresaServico: '',
  // Dados do funcionario
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
}

type FormErrors = Partial<Record<keyof typeof initialFormData, string>>

// Validadores
const validateEmail = (email: string): string | null => {
  if (!email) return 'Email e obrigatorio'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Email invalido'
  return null
}

const validateSenha = (senha: string): string | null => {
  if (!senha) return 'Senha e obrigatoria'
  if (senha.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
  return null
}

const validateCNPJ = (cnpj: string): string | null => {
  if (!cnpj) return 'CNPJ/CPF e obrigatorio'
  const cleanCnpj = cnpj.replace(/\D/g, '')
  if (cleanCnpj.length !== 11 && cleanCnpj.length !== 14) {
    return 'CNPJ deve ter 14 digitos ou CPF 11 digitos'
  }
  return null
}

const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) return `${fieldName} e obrigatorio`
  return null
}

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  const validateStep1 = (): boolean => {
    const errors: FormErrors = {}

    const nomeError = validateRequired(formData.empresaNome, 'Nome da empresa')
    if (nomeError) errors.empresaNome = nomeError

    const cnpjError = validateCNPJ(formData.empresaCnpj)
    if (cnpjError) errors.empresaCnpj = cnpjError

    const enderecoError = validateRequired(formData.empresaEndereco, 'Endereco')
    if (enderecoError) errors.empresaEndereco = enderecoError

    const atividadeError = validateRequired(formData.empresaAtividade, 'Atividade')
    if (atividadeError) errors.empresaAtividade = atividadeError

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: FormErrors = {}

    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError

    const nomeError = validateRequired(formData.nome, 'Nome')
    if (nomeError) errors.nome = nomeError

    const senhaError = validateSenha(formData.senha)
    if (senhaError) errors.senha = senhaError

    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmacao de senha e obrigatoria'
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas nao coincidem'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
      return
    }

    if (!validateStep2()) {
      return
    }

    setLoading(true)

    try {
      await authService.register({
        empresa: {
          nome: formData.empresaNome,
          cnpj: formData.empresaCnpj
        },
        usuario: {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha
        }
      })
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Limpar erro do campo quando o usuario comecar a digitar
    if (fieldErrors[field as keyof FormErrors]) {
      setFieldErrors({ ...fieldErrors, [field]: undefined })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <p className="text-gray-500 mt-2">
            {step === 1 ? 'Dados da Empresa' : 'Dados do Funcionario'}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <StepIndicator active={step >= 1} />
            <StepIndicator active={step >= 2} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-center gap-2">
                <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {step === 1 ? (
              <EmpresaForm formData={formData} updateField={updateField} errors={fieldErrors} />
            ) : (
              <FuncionarioForm
                formData={formData}
                updateField={updateField}
                errors={fieldErrors}
                showSenha={showSenha}
                setShowSenha={setShowSenha}
                showConfirmarSenha={showConfirmarSenha}
                setShowConfirmarSenha={setShowConfirmarSenha}
              />
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
              <Button type="submit" className="flex-1" disabled={loading} loading={loading}>
                {loading ? 'Registrando...' : step === 1 ? 'Proximo' : 'Registrar'}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Ja tem conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Faca login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function StepIndicator({ active }: { active: boolean }) {
  return (
    <div className={`w-3 h-3 rounded-full ${active ? 'bg-blue-600' : 'bg-gray-300'}`} />
  )
}

interface FormSectionProps {
  formData: typeof initialFormData
  updateField: (field: string, value: string) => void
  errors: FormErrors
}

interface FuncionarioFormProps extends FormSectionProps {
  showSenha: boolean
  setShowSenha: (show: boolean) => void
  showConfirmarSenha: boolean
  setShowConfirmarSenha: (show: boolean) => void
}

function EmpresaForm({ formData, updateField, errors }: FormSectionProps) {
  return (
    <>
      <Input
        id="empresaNome"
        label="Nome da Empresa"
        placeholder="MILLIONTECH"
        value={formData.empresaNome}
        onChange={(e) => updateField('empresaNome', e.target.value)}
        error={errors.empresaNome}
        required
      />
      <Input
        id="empresaCnpj"
        label="CNPJ/CPF"
        placeholder="00.000.000/0000-00"
        value={formData.empresaCnpj}
        onChange={(e) => updateField('empresaCnpj', e.target.value)}
        error={errors.empresaCnpj}
        required
      />
      <Input
        id="empresaEndereco"
        label="Endereco"
        placeholder="Rua, Numero"
        value={formData.empresaEndereco}
        onChange={(e) => updateField('empresaEndereco', e.target.value)}
        error={errors.empresaEndereco}
        required
      />
      <Input
        id="empresaAtividade"
        label="Atividade"
        placeholder="Securitizacao de creditos"
        value={formData.empresaAtividade}
        onChange={(e) => updateField('empresaAtividade', e.target.value)}
        error={errors.empresaAtividade}
        required
      />
      <Input
        id="empresaServico"
        label="Servico"
        placeholder="Nome do servico (opcional)"
        value={formData.empresaServico}
        onChange={(e) => updateField('empresaServico', e.target.value)}
      />
    </>
  )
}

function FuncionarioForm({
  formData,
  updateField,
  errors,
  showSenha,
  setShowSenha,
  showConfirmarSenha,
  setShowConfirmarSenha
}: FuncionarioFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        error={errors.email}
        required
      />
      <Input
        id="nome"
        label="Nome Completo"
        placeholder="VINICIUS GABRIEL BENITES LEITE"
        value={formData.nome}
        onChange={(e) => updateField('nome', e.target.value)}
        error={errors.nome}
        required
      />
      <div className="relative">
        <Input
          id="senha"
          label="Senha"
          type={showSenha ? 'text' : 'password'}
          placeholder="Minimo 6 caracteres"
          value={formData.senha}
          onChange={(e) => updateField('senha', e.target.value)}
          error={errors.senha}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
          onClick={() => setShowSenha(!showSenha)}
          tabIndex={-1}
        >
          {showSenha ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="relative">
        <Input
          id="confirmarSenha"
          label="Confirmar Senha"
          type={showConfirmarSenha ? 'text' : 'password'}
          placeholder="Confirme a senha"
          value={formData.confirmarSenha}
          onChange={(e) => updateField('confirmarSenha', e.target.value)}
          error={errors.confirmarSenha}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
          onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
          tabIndex={-1}
        >
          {showConfirmarSenha ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
      <Input
        id="codigoFuncionario"
        label="Codigo Funcionario"
        placeholder="014"
        value={formData.codigoFuncionario}
        onChange={(e) => updateField('codigoFuncionario', e.target.value)}
      />
      <Input
        id="cargo"
        label="Cargo"
        placeholder="DESENVOLVEDOR JUNIOR 1"
        value={formData.cargo}
        onChange={(e) => updateField('cargo', e.target.value)}
      />
      <Input
        id="codigoCargo"
        label="Codigo Cargo"
        placeholder="012"
        value={formData.codigoCargo}
        onChange={(e) => updateField('codigoCargo', e.target.value)}
      />
      <Input
        id="departamento"
        label="Departamento"
        placeholder="SUPORTE"
        value={formData.departamento}
        onChange={(e) => updateField('departamento', e.target.value)}
      />
      <Input
        id="codigoDepartamento"
        label="Codigo Departamento"
        placeholder="001"
        value={formData.codigoDepartamento}
        onChange={(e) => updateField('codigoDepartamento', e.target.value)}
      />
      <Input
        id="ctps"
        label="CTPS"
        placeholder="0560702"
        value={formData.ctps}
        onChange={(e) => updateField('ctps', e.target.value)}
      />
      <Input
        id="ctpsSerie"
        label="Serie CTPS"
        placeholder="9140"
        value={formData.ctpsSerie}
        onChange={(e) => updateField('ctpsSerie', e.target.value)}
      />
      <Input
        id="pis"
        label="PIS"
        placeholder="21314122861"
        value={formData.pis}
        onChange={(e) => updateField('pis', e.target.value)}
      />
    </div>
  )
}
