import axiosClient from '../api/axiosClient'

export interface ReceptionTicketListItem {
  id: string
  poste_id: string
  benevole_username: string
  created_at: string
  closed_at?: string
  status: 'open' | 'closed'
  total_lignes: number
  total_poids: number
}

export interface ReceptionTicketListResponse {
  tickets: ReceptionTicketListItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ReceptionTicketKPIs {
  total_poids: number
  total_tickets: number
  total_lignes: number
  total_benevoles_actifs: number
}

export interface ReceptionTicketFilters {
  page?: number
  per_page?: number
  status?: 'open' | 'closed'
  benevole_id?: string
  site_id?: string
  date_from?: string
  date_to?: string
  search?: string
  include_empty?: boolean
}

export interface LigneResponse {
  id: string
  ticket_id: string
  category_id: string
  category_label: string
  poids_kg: number
  destination?: string
  notes?: string
}

export interface ReceptionTicketDetail {
  id: string
  poste_id: string
  benevole_username: string
  created_at: string
  closed_at?: string
  status: 'open' | 'closed'
  lignes: LigneResponse[]
}

export const receptionTicketsService = {
  async getKPIs(params: Partial<Pick<ReceptionTicketFilters, 'date_from' | 'date_to' | 'benevole_id' | 'site_id'>> = {}): Promise<ReceptionTicketKPIs> {
    // Pour l'instant, calculer côté client depuis les tickets filtrés
    // TODO: Créer endpoint backend /v1/reception/tickets/stats/summary si nécessaire
    // Charger tous les tickets par lots de 100 (limite max du backend)
    let allTickets: ReceptionTicketListItem[] = []
    let page = 1
    const perPage = 100 // Limite maximale du backend
    let hasMore = true
    
    while (hasMore) {
      const listRes = await this.list({ ...params, page, per_page: perPage, include_empty: true })
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
    
    // Filtrer les tickets vides pour les KPIs (exclure ceux avec 0 lignes)
    const filteredTickets = allTickets.filter(t => t.total_lignes > 0)
    
    const totalPoids = filteredTickets.reduce((sum, t) => {
      const poids = typeof t.total_poids === 'number' ? t.total_poids : parseFloat(String(t.total_poids)) || 0
      return sum + poids
    }, 0)
    const totalTickets = filteredTickets.length
    const totalLignes = filteredTickets.reduce((sum, t) => {
      const lignes = typeof t.total_lignes === 'number' ? t.total_lignes : parseInt(String(t.total_lignes), 10) || 0
      return sum + lignes
    }, 0)
    const benevolesUniques = new Set(filteredTickets.map(t => t.benevole_username)).size
    
    return {
      total_poids: totalPoids,
      total_tickets: totalTickets,
      total_lignes: totalLignes,
      total_benevoles_actifs: benevolesUniques
    }
  },

  async list(params: ReceptionTicketFilters = {}): Promise<ReceptionTicketListResponse> {
    const response = await axiosClient.get('/v1/reception/tickets', { params })
    return response.data
  },

  async getDetail(id: string): Promise<ReceptionTicketDetail> {
    const response = await axiosClient.get(`/v1/reception/tickets/${id}`)
    return response.data
  },

  /**
   * Génère un token de téléchargement et lance le téléchargement direct via un lien `<a>`.
   * Cette approche garantit que le navigateur effectue une requête HTTP classique et respecte
   * le header Content-Disposition renvoyé par l'API.
   */
  async exportCSV(id: string): Promise<void> {
    try {
      const response = await axiosClient.post(`/v1/reception/tickets/${id}/download-token`)
      const { download_url } = response.data as { download_url: string }

      // Créer un lien temporaire et déclencher un clic (compatible pop-up blockers)
      const link = document.createElement('a')
      link.href = download_url
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      console.error('Erreur lors de l\'export CSV:', error)
      throw error
    }
  }
}

