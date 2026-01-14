'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FolhaPonto } from '@/components/relatorio/folha-ponto'
import { ReportIcon, DownloadIcon, SearchIcon, ExcelIcon } from '@/components/icons'
import { exportFolhaPresenca, getPeriodo20a20 } from '@/lib/export-folha-presenca'
import { authService, pontoService, funcionariosService } from '@/services/api'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Registro, Usuario, Funcionario } from '@/types'

export default function RelatoriosPage() {
  const folhaRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const periodo20a20 = getPeriodo20a20()
  const [filters, setFilters] = useState({
    dataInicio: periodo20a20.dataInicio,
    dataFim: periodo20a20.dataFim,
    usuarioId: ''
  })

  const checkAdmin = useCallback(async () => {
    try {
      const data = await authService.getMe()
      setIsAdmin(data.user.isAdmin)
      if (data.user.isAdmin) {
        fetchFuncionarios()
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error)
    }
  }, [])

  const fetchFuncionarios = async () => {
    try {
      const data = await funcionariosService.getAll()
      setFuncionarios(data.funcionarios)
    } catch (error) {
      console.error('Erro ao buscar funcionarios:', error)
    }
  }

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  const handleSearch = async () => {
    setLoading(true)

    try {
      const data = await pontoService.getRelatorio({
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim,
        usuarioId: filters.usuarioId || undefined
      })
      setRegistros(data.registros)
      setUsuario(data.usuario)
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
      // Captura o elemento exatamente como está no preview
      const canvas = await html2canvas(folhaRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Força estilos inline no clone para garantir renderização correta
          const cells = clonedDoc.querySelectorAll('td, th')
          cells.forEach((cell) => {
            const el = cell as HTMLElement
            el.style.display = 'table-cell'
            el.style.verticalAlign = 'middle'
            el.style.textAlign = 'center'
          })
        }
      })

      const imgData = canvas.toDataURL('image/png', 1.0)

      // Dimensoes A4 em mm
      const pdfWidth = 210
      const pdfHeight = 297

      // Criar PDF com tamanho A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Calcular proporcoes para manter aspecto e preencher a pagina
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const imgAspect = imgWidth / imgHeight
      const pageAspect = pdfWidth / pdfHeight

      let finalWidth: number
      let finalHeight: number
      let offsetX = 0
      let offsetY = 0

      if (imgAspect > pageAspect) {
        // Imagem mais larga - ajustar pela largura
        finalWidth = pdfWidth
        finalHeight = pdfWidth / imgAspect
        offsetY = (pdfHeight - finalHeight) / 2
      } else {
        // Imagem mais alta - ajustar pela altura
        finalHeight = pdfHeight
        finalWidth = pdfHeight * imgAspect
        offsetX = (pdfWidth - finalWidth) / 2
      }

      // Adicionar imagem centralizada na pagina
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight)

      const fileName = `folha-ponto-${usuario.nome.replace(/\s/g, '-')}-${filters.dataInicio}-${filters.dataFim}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = async () => {
    if (!usuario) return

    setExportingExcel(true)

    try {
      const blob = await exportFolhaPresenca(
        usuario,
        registros,
        new Date(filters.dataInicio),
        new Date(filters.dataFim)
      )

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `folha-presenca-${usuario.nome.replace(/\s/g, '-')}-${filters.dataInicio}-${filters.dataFim}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
    } finally {
      setExportingExcel(false)
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
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            loading={exporting}
            variant="secondary"
            icon={<DownloadIcon />}
          >
            {exporting ? 'Exportando...' : 'Exportar Relatorio'}
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
