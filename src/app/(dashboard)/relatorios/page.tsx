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

const ReportIcon = ({ className = "w-6 h-6 text-blue-600" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

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
      console.error('Erro ao buscar funcionarios:', error)
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
      console.error('Erro ao buscar relatorio:', error)
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
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle icon={<ReportIcon />}>Filtros do Relatorio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              id="dataInicio"
              label="Data Inicio"
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
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Funcionario
                </label>
                <select
                  className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full"
                loading={loading}
                icon={<SearchIcon />}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botao de Exportar */}
      {usuario && registros.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            loading={exporting}
            variant="success"
            icon={<DownloadIcon />}
          >
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
            <div className="border border-slate-300 inline-block bg-white">
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
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <ReportIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">
              Selecione os filtros e clique em &quot;Buscar&quot; para visualizar o relatorio
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
