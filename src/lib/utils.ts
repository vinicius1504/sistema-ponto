import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date | null): string {
  if (!date) return '--:--'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

export function getDayOfWeek(date: Date): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  return days[date.getDay()]
}

export function calculateWorkedHours(
  entrada: Date | null,
  saidaAlmoco: Date | null,
  voltaAlmoco: Date | null,
  saida: Date | null
): number {
  if (!entrada || !saida) return 0

  let totalMinutes = 0

  if (saidaAlmoco && voltaAlmoco) {
    // Período da manhã
    const morningMinutes = (saidaAlmoco.getTime() - entrada.getTime()) / (1000 * 60)
    // Período da tarde
    const afternoonMinutes = (saida.getTime() - voltaAlmoco.getTime()) / (1000 * 60)
    totalMinutes = morningMinutes + afternoonMinutes
  } else {
    // Sem intervalo
    totalMinutes = (saida.getTime() - entrada.getTime()) / (1000 * 60)
  }

  return Math.max(0, totalMinutes)
}

export function minutesToHoursString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function getNextPunchType(registro: {
  entrada: Date | null
  saidaAlmoco: Date | null
  voltaAlmoco: Date | null
  saida: Date | null
} | null): 'entrada' | 'saidaAlmoco' | 'voltaAlmoco' | 'saida' | 'completo' {
  if (!registro || !registro.entrada) return 'entrada'
  if (!registro.saidaAlmoco) return 'saidaAlmoco'
  if (!registro.voltaAlmoco) return 'voltaAlmoco'
  if (!registro.saida) return 'saida'
  return 'completo'
}

export function getPunchTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    entrada: 'Entrada',
    saidaAlmoco: 'Saída Almoço',
    voltaAlmoco: 'Volta Almoço',
    saida: 'Saída',
    completo: 'Dia Completo'
  }
  return labels[type] || type
}

export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

// Formata string de tempo ISO para exibição HH:MM (sem conversão de fuso horário)
export function formatTimeFromString(timeStr: string | null): string {
  if (!timeStr) return ''
  try {
    // Extrair apenas HH:MM da string ISO sem conversão de fuso horário
    const match = timeStr.match(/T(\d{2}:\d{2})/)
    if (match) return match[1]

    // Fallback para strings que já são apenas hora
    if (/^\d{2}:\d{2}/.test(timeStr)) return timeStr.slice(0, 5)

    return ''
  } catch {
    return ''
  }
}

// Formata string de tempo ISO para input type="time" (HH:MM)
export function formatTimeForInput(timeStr: string | null): string {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return ''
  }
}

// Cria um Map de registros indexados por data para lookup O(1)
export function createRegistroMap<T extends { data: string }>(registros: T[]): Map<string, T> {
  const map = new Map<string, T>()
  registros.forEach(r => {
    const dateStr = r.data.split('T')[0]
    map.set(dateStr, r)
  })
  return map
}

// Busca registro por data no Map
export function getRegistroByDate<T>(map: Map<string, T>, date: Date): T | undefined {
  const dateStr = date.toISOString().split('T')[0]
  return map.get(dateStr)
}
