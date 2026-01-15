export interface TodayPunch {
  entrada: string | null
  saidaAlmoco: string | null
  voltaAlmoco: string | null
  saida: string | null
}

export interface Registro {
  data: string
  entrada: string | null
  saidaAlmoco: string | null
  voltaAlmoco: string | null
  saida: string | null
  horasExtras: number
}

export type PunchType = 'entrada' | 'saidaAlmoco' | 'voltaAlmoco' | 'saida' | 'completo'

export interface BaterPontoResponse {
  mensagem: string
  tipo: PunchType
  horario: string
}

export interface RelatorioParams {
  dataInicio: string
  dataFim: string
  usuarioId?: string
}

export interface RelatorioResponse {
  registros: Registro[]
  usuario: import('./user').Usuario
}

export interface EditPontoData {
  entrada?: string | null
  saidaAlmoco?: string | null
  voltaAlmoco?: string | null
  saida?: string | null
}
