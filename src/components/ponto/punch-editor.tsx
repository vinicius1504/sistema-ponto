'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { pontoService } from '@/services/api'
import type { TodayPunch, EditPontoData } from '@/types'

interface PunchEditorProps {
  isOpen: boolean
  onClose: () => void
  currentPunch: TodayPunch | null
  onSave: () => void
}

function formatTimeForInput(timeStr: string | null): string {
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

export function PunchEditor({ isOpen, onClose, currentPunch, onSave }: PunchEditorProps) {
  const [formData, setFormData] = useState<EditPontoData>({
    entrada: '',
    saidaAlmoco: '',
    voltaAlmoco: '',
    saida: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && currentPunch) {
      setFormData({
        entrada: formatTimeForInput(currentPunch.entrada),
        saidaAlmoco: formatTimeForInput(currentPunch.saidaAlmoco),
        voltaAlmoco: formatTimeForInput(currentPunch.voltaAlmoco),
        saida: formatTimeForInput(currentPunch.saida)
      })
      setError('')
    }
  }, [isOpen, currentPunch])

  const handleChange = (field: keyof EditPontoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleClear = (field: keyof EditPontoData) => {
    setFormData(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const today = new Date().toISOString().split('T')[0]

      // Converter strings vazias para null
      const updates: EditPontoData = {
        entrada: formData.entrada || null,
        saidaAlmoco: formData.saidaAlmoco || null,
        voltaAlmoco: formData.voltaAlmoco || null,
        saida: formData.saida || null
      }

      await pontoService.editarPonto(today, updates)
      onSave()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alteracoes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Ponto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              id="entrada"
              type="time"
              label="Entrada"
              value={formData.entrada || ''}
              onChange={(e) => handleChange('entrada', e.target.value)}
            />
            {formData.entrada && (
              <button
                type="button"
                onClick={() => handleClear('entrada')}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Limpar
              </button>
            )}
          </div>

          <div>
            <Input
              id="saidaAlmoco"
              type="time"
              label="Saida Almoco"
              value={formData.saidaAlmoco || ''}
              onChange={(e) => handleChange('saidaAlmoco', e.target.value)}
            />
            {formData.saidaAlmoco && (
              <button
                type="button"
                onClick={() => handleClear('saidaAlmoco')}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Limpar
              </button>
            )}
          </div>

          <div>
            <Input
              id="voltaAlmoco"
              type="time"
              label="Volta Almoco"
              value={formData.voltaAlmoco || ''}
              onChange={(e) => handleChange('voltaAlmoco', e.target.value)}
            />
            {formData.voltaAlmoco && (
              <button
                type="button"
                onClick={() => handleClear('voltaAlmoco')}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Limpar
              </button>
            )}
          </div>

          <div>
            <Input
              id="saida"
              type="time"
              label="Saida"
              value={formData.saida || ''}
              onChange={(e) => handleChange('saida', e.target.value)}
            />
            {formData.saida && (
              <button
                type="button"
                onClick={() => handleClear('saida')}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
