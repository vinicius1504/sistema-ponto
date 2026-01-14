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
