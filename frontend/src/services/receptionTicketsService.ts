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
      const listRes = await this.list({ ...params, page, per_page: perPage })
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
    
    const totalPoids = allTickets.reduce((sum, t) => {
      const poids = typeof t.total_poids === 'number' ? t.total_poids : parseFloat(String(t.total_poids)) || 0
      return sum + poids
    }, 0)
    const totalTickets = allTickets.length
    const totalLignes = allTickets.reduce((sum, t) => {
      const lignes = typeof t.total_lignes === 'number' ? t.total_lignes : parseInt(String(t.total_lignes), 10) || 0
      return sum + lignes
    }, 0)
    const benevolesUniques = new Set(allTickets.map(t => t.benevole_username)).size
    
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

  async exportCSV(id: string): Promise<Blob> {
    const response = await axiosClient.get(`/v1/reception/tickets/${id}/export-csv`, {
      responseType: 'blob'
    })
    return response.data
  }
}

