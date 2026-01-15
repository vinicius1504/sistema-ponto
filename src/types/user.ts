export interface User {
  id: string
  nome: string
  email: string
  isAdmin: boolean
  cargo: string
  codigoFuncionario: string
  departamento: string
  empresa: {
    id: string
    nome: string
  }
}

export interface Usuario {
  id: string
  nome: string
  codigoFuncionario: string
  cargo: string
  codigoCargo: string
  departamento: string
  codigoDepartamento: string
  ctps: string
  ctpsSerie: string
  pis: string
  // Campos customizaveis de empresa (sobrescrevem os dados da empresa)
  empresaNomeCustom?: string | null
  empresaCnpjCustom?: string | null
  empresaEnderecoCustom?: string | null
  empresaAtividadeCustom?: string | null
  empresaServicoCustom?: string | null
  empresa: {
    nome: string
    cnpj: string
    endereco: string
    atividade: string
    servico: string | null
  }
}

export interface Funcionario {
  id: string
  nome: string
  codigoFuncionario: string
}

export interface RegisterData {
  empresa: {
    nome: string
    cnpj: string
  }
  usuario: {
    nome: string
    email: string
    senha: string
  }
}

export interface CreateFuncionarioData {
  nome: string
  email: string
  senha: string
  cargo: string
}

export interface UpdateFuncionarioData {
  nome?: string
  email?: string
  senha?: string
  codigoFuncionario?: string
  cargo?: string
  codigoCargo?: string
  departamento?: string
  codigoDepartamento?: string
  ctps?: string
  ctpsSerie?: string
  pis?: string
  isAdmin?: boolean
  // Campos customizaveis de empresa
  empresaNomeCustom?: string | null
  empresaCnpjCustom?: string | null
  empresaEnderecoCustom?: string | null
  empresaAtividadeCustom?: string | null
  empresaServicoCustom?: string | null
}

export interface FuncionarioCompleto {
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
  createdAt: string
  // Campos customizaveis de empresa
  empresaNomeCustom: string | null
  empresaCnpjCustom: string | null
  empresaEnderecoCustom: string | null
  empresaAtividadeCustom: string | null
  empresaServicoCustom: string | null
  empresa?: {
    id: string
    nome: string
    cnpj: string
    endereco: string
    atividade: string
    servico: string | null
  }
}
