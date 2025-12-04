import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { Calendar, Users, Scale, Package, Search, ChevronUp, ChevronDown, ChevronsUpDown, Download, FileSpreadsheet, FileText, FileSpreadsheetIcon } from 'lucide-react'
import { receptionTicketsService, ReceptionTicketFilters, ReceptionTicketKPIs, ReceptionTicketListItem, receptionTicketFiltersUrl } from '../../services/receptionTicketsService'
import { getUsers, User } from '../../services/usersService'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdvancedFiltersAccordion, FiltersGridContainer, FilterInput, FilterMultiSelect } from '../../components/Admin/AdvancedFiltersAccordion'
import axiosClient from '../../api/axiosClient'

type SortField = 'created_at' | 'benevole_username' | 'status' | 'total_lignes' | 'total_poids'
type SortDirection = 'asc' | 'desc' | null

const Container = styled.div`
  padding: 24px;
`

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  color: #1f2937;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: ${p => p.$variant === 'ghost' ? '1px solid #e5e7eb' : 'none'};
  background: ${p => p.$variant === 'ghost' ? '#fff' : '#111827'};
  color: ${p => p.$variant === 'ghost' ? '#111827' : '#fff'};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ExportButton = styled(Button)`
  position: relative;
`

const DropdownMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: ${p => p.$open ? 'block' : 'none'};
  min-width: 180px;
  overflow: hidden;
`

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: #fff;
  color: #111827;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr)) 1fr;
  gap: 12px;
  margin-bottom: 16px;
`

const SearchActionsRow = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ActionsGroup = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
`

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
`

const KPICards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
  margin: 12px 0 20px 0;
`

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f3f4f6;
  color: #111827;
`

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`

const CardLabel = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`

const CardValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
`

const Th = styled.th<{ $sortable?: boolean }>`
  text-align: left;
  padding: 12px;
  background: #f9fafb;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
  cursor: ${p => p.$sortable ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
  
  &:hover {
    background: ${p => p.$sortable ? '#f3f4f6' : '#f9fafb'};
  }
`

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  vertical-align: middle;
`

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.95rem;
  color: #1f2937;
`

const StatusDot = styled.span<{ variant: 'open' | 'closed' }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  margin-right: 8px;
  background: ${p => p.variant === 'open' ? '#16a34a' : '#ef4444'};
`

const ActionsCell = styled.div`
  display: flex;
  gap: 8px;
`

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`

const PaginationInfo = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
`

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: ${p => p.$active ? '#111827' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#111827'};
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover:not(:disabled) {
    background: ${p => p.$active ? '#111827' : '#f3f4f6'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

function formatWeight(value: number): string {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
  return numValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const ReceptionSessionManager: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ReceptionTicketFilters>(() => {
    // B45-P2: Charger les filtres depuis l'URL au montage
    const urlFilters = receptionTicketFiltersUrl.decode(searchParams)
    // Par défaut, inclure les tickets vides pour voir tous les tickets
    return { page: 1, per_page: 20, include_empty: true, ...urlFilters }
  })
  const [kpis, setKpis] = useState<ReceptionTicketKPIs | null>(null)
  const [allTickets, setAllTickets] = useState<ReceptionTicketListItem[]>([]) // Tous les tickets chargés
  const [rows, setRows] = useState<ReceptionTicketListItem[]>([]) // Tickets paginés à afficher
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [benevoles, setBenevoles] = useState<{ id: string, label: string }[]>([])
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Fonction pour récupérer le nom de l'utilisateur
  const getUserName = useCallback((username: string): string => {
    return username || 'Inconnu'
  }, [])

  const load = useCallback(async (currentFilters: ReceptionTicketFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      // Formater les dates pour l'API (ISO 8601)
      const formattedFilters: ReceptionTicketFilters = {
        ...currentFilters,
        date_from: currentFilters.date_from ? `${currentFilters.date_from}T00:00:00.000Z` : undefined,
        date_to: currentFilters.date_to ? `${currentFilters.date_to}T23:59:59.999Z` : undefined,
      }
      
      // Charger les KPIs (calcul côté client depuis les tickets filtrés)
      const kpiRes = await receptionTicketsService.getKPIs({ 
        date_from: formattedFilters.date_from, 
        date_to: formattedFilters.date_to,
        benevole_id: formattedFilters.benevole_id
      })
      setKpis(kpiRes)
      
      // Charger TOUTES les tickets par lots de 100 (limite max du backend)
      // pour pouvoir trier sur l'ensemble
      let allTickets: ReceptionTicketListItem[] = []
      let page = 1
      const perPage = 100 // Limite maximale du backend
      let hasMore = true
      
      while (hasMore) {
        const fetchFilters: ReceptionTicketFilters = {
          ...formattedFilters,
          page,
          per_page: perPage
        }
        
        const listRes = await receptionTicketsService.list(fetchFilters)
        const batch = listRes?.tickets || []
        
        if (batch.length === 0) {
          hasMore = false
        } else {
          allTickets = [...allTickets, ...batch]
          page += 1
          
          // Si on a reçu moins que la limite, on a tout chargé
          if (batch.length < perPage) {
            hasMore = false
          }
          
          // Sécurité : ne pas charger plus de 1000 tickets (10 lots)
          if (allTickets.length >= 1000) {
            hasMore = false
          }
        }
      }
      
      // Tri côté client sur TOUS les tickets chargés
      if (sortField && sortDirection) {
        allTickets = [...allTickets].sort((a, b) => {
          let aVal: any = a[sortField]
          let bVal: any = b[sortField]
          
          // Gestion spéciale pour les dates
          if (sortField === 'created_at') {
            aVal = new Date(aVal).getTime()
            bVal = new Date(bVal).getTime()
          }
          
          // Gestion spéciale pour benevole_username (tri par nom)
          if (sortField === 'benevole_username') {
            const aName = (aVal || '').toLowerCase()
            const bName = (bVal || '').toLowerCase()
            if (aName < bName) return sortDirection === 'asc' ? -1 : 1
            if (aName > bName) return sortDirection === 'asc' ? 1 : -1
            return 0
          }
          
          // Tri numérique pour les nombres
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
          }
          
          // Tri string
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDirection === 'asc' 
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal)
          }
          
          // Fallback
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
          return 0
        })
      }
      
      // Stocker tous les tickets triés
      setAllTickets(allTickets)
      setTotal(allTickets.length)
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du chargement des tickets')
    } finally {
      setLoading(false)
    }
  }, [filters, sortField, sortDirection])
  
  // Pagination côté client sur les tickets triés
  useEffect(() => {
    if (allTickets.length === 0) {
      setRows([])
      return
    }
    
    const page = filters.page || 1
    const perPage = filters.per_page || 20
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    
    const paginatedTickets = allTickets.slice(startIndex, endIndex)
    setRows(paginatedTickets)
  }, [allTickets, filters.page, filters.per_page])

  useEffect(() => {
    ;(async () => {
      try {
        const [usersData, categoriesData] = await Promise.all([
          getUsers().catch(() => []),
          axiosClient.get('/v1/reception/categories').then(res => res.data || []).catch(() => [])
        ])
        const benevolesOpts = usersData.map((u) => ({ 
          id: u.id, 
          label: u.full_name || u.first_name || u.username || u.id 
        }))
        setBenevoles(benevolesOpts)
        setUsers(usersData)
        setCategories(categoriesData.map((c: any) => ({ id: c.id, name: c.name })))
      } catch {}
    })()
  }, [])

  // Charger les données initiales au montage
  useEffect(() => {
    load(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // B45-P2: Synchroniser les filtres avec l'URL
  useEffect(() => {
    const queryString = receptionTicketFiltersUrl.encode(filters)
    const newSearchParams = new URLSearchParams(queryString)
    setSearchParams(newSearchParams, { replace: true })
  }, [filters, setSearchParams])

  // Recharger quand les filtres ou le tri changent (mais pas au montage initial)
  // Note: page et per_page ne déclenchent pas de rechargement car la pagination est côté client
  useEffect(() => {
    const timer = setTimeout(() => {
      load(filters)
    }, 100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.status, filters.benevole_id, filters.search, 
    filters.date_from, filters.date_to,
    // B45-P2: Filtres avancés - utiliser JSON.stringify pour comparer les tableaux
    filters.poids_min, filters.poids_max, 
    JSON.stringify(filters.categories || []),
    JSON.stringify(filters.destinations || []),
    filters.lignes_min, filters.lignes_max,
    sortField, sortDirection
  ])

  const onFilterChange = (patch: Partial<ReceptionTicketFilters>) => {
    const next = { ...filters, ...patch, page: 1 } // Reset pagination when filters change
    setFilters(next)
  }

  const onApplyFilters = () => {
    // Reset pagination et recharger avec les nouveaux filtres
    const next = { ...filters, page: 1 }
    setFilters(next)
    // Le useEffect se chargera du rechargement automatiquement
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle: desc -> asc -> null -> desc
      if (sortDirection === 'desc') {
        setSortDirection('asc')
      } else if (sortDirection === 'asc') {
        setSortDirection(null)
        setSortField('created_at') // Reset to default
        setSortDirection('desc')
      }
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    // Reset pagination à la première page lors du tri
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp size={14} />
    }
    if (sortDirection === 'desc') {
      return <ChevronDown size={14} />
    }
    return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />
  }

  const currentPage = filters.page || 1
  const perPage = filters.per_page || 20
  const totalPages = Math.max(1, Math.ceil((total || 0) / perPage))
  
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
  }

  const handleExportCSV = async (ticketId: string) => {
    try {
      await receptionTicketsService.exportCSV(ticketId)
    } catch (err) {
      console.error('Erreur lors du téléchargement du CSV:', err)
      alert('Erreur lors du téléchargement du CSV')
    }
  }

  // Fermer le menu d'export si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [exportMenuOpen])

  const handleExport = async (format: 'csv' | 'excel') => {
    setExportMenuOpen(false)
    setExporting(true)
    try {
      // Préparer les filtres pour l'export (sans pagination)
      // Formater les dates pour l'API (ISO 8601 avec heure)
      const exportFilters: ReceptionTicketFilters = {
        date_from: filters.date_from ? `${filters.date_from}T00:00:00.000Z` : undefined,
        date_to: filters.date_to ? `${filters.date_to}T23:59:59.999Z` : undefined,
        status: filters.status,
        benevole_id: filters.benevole_id,
        search: filters.search,
        include_empty: filters.include_empty
      }
      
      await receptionTicketsService.exportBulk(exportFilters, format)
    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error)
      alert(`Erreur lors de l'export: ${error.message || 'Erreur inconnue'}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Container>
      <TitleBar>
        <Title>Sessions de Réception</Title>
        <Toolbar>
          <Button
            $variant="ghost"
            onClick={() => navigate('/admin/import/legacy')}
            type="button"
            title="Importer l'historique depuis un CSV nettoyé (template offline)"
          >
            <FileSpreadsheetIcon size={16} />
            <span>Importer CSV legacy</span>
          </Button>
        </Toolbar>
      </TitleBar>

      <FiltersBar>
        <Input 
          type="date" 
          value={filters.date_from || ''} 
          onChange={e => onFilterChange({ date_from: e.target.value })} 
          placeholder="Date début"
        />
        <Input 
          type="date" 
          value={filters.date_to || ''} 
          onChange={e => onFilterChange({ date_to: e.target.value })} 
          placeholder="Date fin"
        />
        <Select value={filters.status || ''} onChange={e => onFilterChange({ status: (e.target.value || undefined) as any })}>
          <option value="">Tous statuts</option>
          <option value="open">Ouverts</option>
          <option value="closed">Fermés</option>
        </Select>
        <Select value={filters.benevole_id || ''} onChange={e => onFilterChange({ benevole_id: e.target.value || undefined })}>
          <option value="">Tous bénévoles</option>
          {benevoles.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </Select>
      </FiltersBar>

      <SearchActionsRow>
        <SearchBox>
          <Search size={16} />
          <Input 
            placeholder="Recherche (ID ticket ou bénévole)" 
            value={filters.search || ''} 
            onChange={e => onFilterChange({ search: e.target.value || undefined })} 
            onKeyDown={e => e.key === 'Enter' && onApplyFilters()} 
          />
        </SearchBox>
        <ActionsGroup>
          <Button onClick={onApplyFilters}>Appliquer les filtres</Button>
          <Toolbar ref={exportMenuRef}>
            <ExportButton 
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={exporting || total === 0}
              $variant="primary"
            >
              <Download size={16} />
              {exporting ? 'Export en cours...' : 'Exporter (CSV/Excel)'}
            </ExportButton>
            <DropdownMenu $open={exportMenuOpen}>
              <DropdownItem onClick={() => handleExport('csv')} disabled={exporting}>
                <FileText size={16} />
                Exporter en CSV
              </DropdownItem>
              <DropdownItem onClick={() => handleExport('excel')} disabled={exporting}>
                <FileSpreadsheet size={16} />
                Exporter en Excel
              </DropdownItem>
            </DropdownMenu>
          </Toolbar>
        </ActionsGroup>
      </SearchActionsRow>

      {/* B45-P2: Filtres avancés */}
      <AdvancedFiltersAccordion title="Filtres Avancés">
        <FiltersGridContainer>
          <FilterInput
            label="Poids minimum (kg)"
            type="number"
            value={filters.poids_min}
            onChange={(v) => onFilterChange({ poids_min: v ? parseFloat(v) : undefined })}
            placeholder="0.00"
            min={0}
            step={0.01}
          />
          <FilterInput
            label="Poids maximum (kg)"
            type="number"
            value={filters.poids_max}
            onChange={(v) => onFilterChange({ poids_max: v ? parseFloat(v) : undefined })}
            placeholder="0.00"
            min={0}
            step={0.01}
          />
          <FilterMultiSelect
            label="Catégories"
            selected={filters.categories || []}
            onChange={(selected) => onFilterChange({ categories: selected.length > 0 ? selected : undefined })}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />
          <FilterMultiSelect
            label="Destinations"
            selected={filters.destinations || []}
            onChange={(selected) => onFilterChange({ destinations: selected.length > 0 ? selected : undefined })}
            options={[
              { value: 'MAGASIN', label: 'Magasin' },
              { value: 'RECYCLAGE', label: 'Recyclage' },
              { value: 'DECHETERIE', label: 'Déchetterie' }
            ]}
          />
          <FilterInput
            label="Nombre minimum de lignes"
            type="number"
            value={filters.lignes_min}
            onChange={(v) => onFilterChange({ lignes_min: v ? parseInt(v, 10) : undefined })}
            placeholder="0"
            min={0}
            step={1}
          />
          <FilterInput
            label="Nombre maximum de lignes"
            type="number"
            value={filters.lignes_max}
            onChange={(v) => onFilterChange({ lignes_max: v ? parseInt(v, 10) : undefined })}
            placeholder="0"
            min={0}
            step={1}
          />
        </FiltersGridContainer>
      </AdvancedFiltersAccordion>

      <KPICards>
        <Card>
          <CardIcon><Scale size={18} /></CardIcon>
          <CardContent>
            <CardLabel>Poids Total Reçu</CardLabel>
            <CardValue>{formatWeight(kpis?.total_poids || 0)} kg</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardIcon><Package size={18} /></CardIcon>
          <CardContent>
            <CardLabel>Nombre de Tickets</CardLabel>
            <CardValue>{kpis?.total_tickets ?? 0}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardIcon><Package size={18} /></CardIcon>
          <CardContent>
            <CardLabel>Nombre de Lignes</CardLabel>
            <CardValue>{kpis?.total_lignes ?? 0}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardIcon><Users size={18} /></CardIcon>
          <CardContent>
            <CardLabel>Bénévoles Actifs</CardLabel>
            <CardValue>{kpis?.total_benevoles_actifs ?? 0}</CardValue>
          </CardContent>
        </Card>
      </KPICards>

      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>}
      {error && <div style={{ padding: '20px', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      
      <Table>
        <thead>
          <tr>
            <Th $sortable onClick={() => handleSort('status')}>
              Statut
              <SortIcon>{getSortIcon('status')}</SortIcon>
            </Th>
            <Th $sortable onClick={() => handleSort('created_at')}>
              Date création
              <SortIcon>{getSortIcon('created_at')}</SortIcon>
            </Th>
            <Th $sortable onClick={() => handleSort('benevole_username')}>
              Bénévole
              <SortIcon>{getSortIcon('benevole_username')}</SortIcon>
            </Th>
            <Th $sortable onClick={() => handleSort('total_lignes')}>
              Nb lignes
              <SortIcon>{getSortIcon('total_lignes')}</SortIcon>
            </Th>
            <Th $sortable onClick={() => handleSort('total_poids')}>
              Poids total (kg)
              <SortIcon>{getSortIcon('total_poids')}</SortIcon>
            </Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && !loading ? (
            <tr>
              <Td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Aucun ticket trouvé
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} onClick={() => navigate(`/admin/reception-tickets/${row.id}`)} style={{ cursor: 'pointer' }}>
                <Td><StatusDot variant={row.status} />{row.status === 'open' ? 'Ouvert' : 'Fermé'}</Td>
                <Td>{new Date(row.created_at).toLocaleString('fr-FR')}</Td>
                <Td>{getUserName(row.benevole_username)}</Td>
                <Td>{row.total_lignes || 0}</Td>
                <Td>{formatWeight(row.total_poids || 0)}</Td>
                <Td>
                  <ActionsCell>
                    <Button onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/reception-tickets/${row.id}`)
                    }}>Voir Détail</Button>
                    <Button $variant='ghost' onClick={async (e) => {
                      e.stopPropagation()
                      await handleExportCSV(row.id)
                    }}>Télécharger CSV</Button>
                  </ActionsCell>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {total > 0 && (
        <PaginationContainer>
          <PaginationInfo>
            Affichage de {Math.min((currentPage - 1) * perPage + 1, total)} à {Math.min(currentPage * perPage, total)} sur {total} tickets
          </PaginationInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', color: '#6b7280' }} htmlFor="items-per-page">
              Tickets par page:
            </label>
            <Select 
              id="items-per-page"
              value={perPage} 
              onChange={(e) => {
                const newPerPage = parseInt(e.target.value, 10)
                setFilters({ ...filters, per_page: newPerPage, page: 1 })
              }}
              style={{ width: 'auto', minWidth: '80px' }}
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
          <PaginationControls>
            <PageButton 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1}
            >
              Première
            </PageButton>
            <PageButton 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Précédent
            </PageButton>
            <span style={{ padding: '0 8px', fontSize: '0.9rem' }}>
              Page {currentPage} sur {totalPages}
            </span>
            <PageButton 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage >= totalPages}
            >
              Suivant
            </PageButton>
            <PageButton 
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage >= totalPages}
            >
              Dernière
            </PageButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </Container>
  )
}

export default ReceptionSessionManager

