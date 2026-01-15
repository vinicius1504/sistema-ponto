'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FolhaPonto } from '@/components/relatorio/folha-ponto'
import { FolhaPontoPDF } from '@/components/relatorio/folha-ponto-pdf'
import { FolhaPontoEditor } from '@/components/relatorio/folha-ponto-editor'
import { Modal } from '@/components/ui/modal'
import { ReportIcon, DownloadIcon, SearchIcon, EditIcon } from '@/components/icons'
import { exportFolhaPresenca, getPeriodo20a20 } from '@/lib/export-folha-presenca'
import { authService, pontoService, funcionariosService } from '@/services/api'
import { pdf } from '@react-pdf/renderer'
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
  const [isEditMode, setIsEditMode] = useState(false)

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
    if (!usuario) return

    setExporting(true)

    try {
      // Gerar PDF usando @react-pdf/renderer
      const blob = await pdf(
        <FolhaPontoPDF
          usuario={usuario}
          registros={registros}
          dataInicio={new Date(filters.dataInicio)}
          dataFim={new Date(filters.dataFim)}
        />
      ).toBlob()

      // Criar link para download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `folha-ponto-${usuario.nome.replace(/\s/g, '-')}-${filters.dataInicio}-${filters.dataFim}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
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

      {/* Botoes de Acao */}
      {usuario && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setIsEditMode(true)}
            variant="secondary"
            icon={<EditIcon />}
          >
            Editar Horarios
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            loading={exporting}
            variant="primary"
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
          <CardContent>
            <div className="border border-slate-300 bg-white overflow-auto">
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

      {/* Modal do Editor */}
      <Modal
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <FolhaPontoEditor
          usuario={usuario!}
          registros={registros}
          dataInicio={new Date(filters.dataInicio)}
          dataFim={new Date(filters.dataFim)}
          usuarioId={filters.usuarioId || undefined}
          onSave={() => {
            setIsEditMode(false)
            handleSearch()
          }}
          onCancel={() => setIsEditMode(false)}
        />
      </Modal>

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
