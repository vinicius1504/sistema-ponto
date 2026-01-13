'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FolhaPonto } from '@/components/relatorio/folha-ponto'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface Registro {
  data: string
  entrada: string | null
  saidaAlmoco: string | null
  voltaAlmoco: string | null
  saida: string | null
  horasExtras: number
}

interface Usuario {
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

interface Funcionario {
  id: string
  nome: string
  codigoFuncionario: string
}

export default function RelatoriosPage() {
  const folhaRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const [filters, setFilters] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    usuarioId: ''
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.user.isAdmin)
        if (data.user.isAdmin) {
          fetchFuncionarios()
        }
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error)
    }
  }

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

  const handleSearch = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim
      })

      if (filters.usuarioId) {
        params.append('usuarioId', filters.usuarioId)
      }

      const response = await fetch(`/api/ponto/relatorio?${params}`)

      if (response.ok) {
        const data = await response.json()
        setRegistros(data.registros)
        setUsuario(data.usuario)
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!folhaRef.current || !usuario) return

    setExporting(true)

    try {
      const canvas = await html2canvas(folhaRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      )

      const fileName = `folha-ponto-${usuario.nome.replace(/\s/g, '-')}-${filters.dataInicio}-${filters.dataFim}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              id="dataInicio"
              label="Data Início"
              type="date"
              value={filters.dataInicio}
              onChange={(e) =>
                setFilters({ ...filters, dataInicio: e.target.value })
              }
            />
            <Input
              id="dataFim"
              label="Data Fim"
              type="date"
              value={filters.dataFim}
              onChange={(e) =>
                setFilters({ ...filters, dataFim: e.target.value })
              }
            />

            {isAdmin && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Funcionário
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filters.usuarioId}
                  onChange={(e) =>
                    setFilters({ ...filters, usuarioId: e.target.value })
                  }
                >
                  <option value="">Selecione...</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codigoFuncionario} - {f.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Exportar */}
      {usuario && registros.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleExportPDF} disabled={exporting}>
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      )}

      {/* Preview da Folha */}
      {usuario && (
        <Card>
          <CardHeader>
            <CardTitle>Preview da Folha de Ponto</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="border border-gray-300 inline-block">
              <FolhaPonto
                ref={folhaRef}
                usuario={usuario}
                registros={registros}
                dataInicio={new Date(filters.dataInicio)}
                dataFim={new Date(filters.dataFim)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!usuario && !loading && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Selecione os filtros e clique em "Buscar" para visualizar o
            relatório
          </CardContent>
        </Card>
      )}
    </div>
  )
}
