import type {
  User,
  Usuario,
  Funcionario,
  FuncionarioCompleto,
  TodayPunch,
  Registro,
  RegisterData,
  CreateFuncionarioData,
  UpdateFuncionarioData,
  RelatorioParams,
  EditPontoData
} from '@/types'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Erro na requisição')
  }

  return data
}

// Auth Service
export const authService = {
  async login(email: string, senha: string): Promise<{ user: User }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
    return handleResponse(response)
  },

  async register(data: RegisterData): Promise<{ user: User }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
  },

  async getMe(): Promise<{ user: User }> {
    const response = await fetch('/api/auth/me')
    return handleResponse(response)
  }
}

// Ponto Service
export const pontoService = {
  async getTodayPunch(data: string): Promise<{ registro: TodayPunch | null }> {
    const response = await fetch(`/api/ponto?data=${data}`)
    return handleResponse(response)
  },

  async baterPonto(): Promise<{ mensagem: string; tipo: string; horario: string }> {
    const response = await fetch('/api/ponto/bater', { method: 'POST' })
    return handleResponse(response)
  },

  async getRelatorio(params: RelatorioParams): Promise<{ registros: Registro[]; usuario: Usuario }> {
    const searchParams = new URLSearchParams({
      dataInicio: params.dataInicio,
      dataFim: params.dataFim
    })

    if (params.usuarioId) {
      searchParams.append('usuarioId', params.usuarioId)
    }

    const response = await fetch(`/api/ponto/relatorio?${searchParams}`)
    return handleResponse(response)
  },

  async editarPonto(data: string, updates: EditPontoData, usuarioId?: string): Promise<{ mensagem: string; registro: TodayPunch }> {
    const params = new URLSearchParams({ data })
    if (usuarioId) {
      params.append('usuarioId', usuarioId)
    }
    const response = await fetch(`/api/ponto?${params}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    return handleResponse(response)
  }
}

// Funcionarios Service
export const funcionariosService = {
  async getAll(): Promise<{ funcionarios: FuncionarioCompleto[] }> {
    const response = await fetch('/api/funcionarios')
    return handleResponse(response)
  },

  async getById(id: string): Promise<{ funcionario: FuncionarioCompleto }> {
    const response = await fetch(`/api/funcionarios/${id}`)
    return handleResponse(response)
  },

  async create(data: CreateFuncionarioData): Promise<{ funcionario: Funcionario }> {
    const response = await fetch('/api/funcionarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: string, data: UpdateFuncionarioData): Promise<{ funcionario: FuncionarioCompleto }> {
    const response = await fetch(`/api/funcionarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/funcionarios/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  }
}

export { ApiError }
