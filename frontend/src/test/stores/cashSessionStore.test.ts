import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock du service avant l'import
vi.mock('../../services/cashSessionService', () => ({
  cashSessionService: {
    closeSession: vi.fn(),
    closeSessionWithAmounts: vi.fn()
  }
}))

// Mock axiosClient avant l'import
vi.mock('../../api/axiosClient', () => ({
  default: {
    post: vi.fn()
  }
}))

import { useCashSessionStore } from '../../stores/cashSessionStore'
import { cashSessionService } from '../../services/cashSessionService'
import axiosClient from '../../api/axiosClient'

// Récupérer les mocks après l'import
const mockCloseSession = vi.mocked(cashSessionService.closeSession)
const mockCloseSessionWithAmounts = vi.mocked(cashSessionService.closeSessionWithAmounts)
const mockAxiosPost = vi.mocked(axiosClient.post)

describe('cashSessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useCashSessionStore.setState({
      currentSession: null,
      loading: false,
      error: null
    })
  })

  describe('closeSession', () => {
    it('should close session without amounts when no closeData provided', async () => {
      mockCloseSession.mockResolvedValue(true)
      
      const store = useCashSessionStore.getState()
      const result = await store.closeSession('session-123')
      
      expect(mockCloseSession).toHaveBeenCalledWith('session-123')
      expect(result).toBe(true)
    })

    it('should close session with amounts when closeData provided', async () => {
      const mockClosedSession = {
        id: 'session-123',
        status: 'closed',
        actual_amount: 75.0,
        variance: 0.0
      }
      
      mockCloseSessionWithAmounts.mockResolvedValue(mockClosedSession)
      
      const store = useCashSessionStore.getState()
      const result = await store.closeSession('session-123', {
        actual_amount: 75.0,
        variance_comment: 'Test comment'
      })
      
      expect(mockCloseSessionWithAmounts).toHaveBeenCalledWith('session-123', 75.0, 'Test comment')
      expect(result).toBe(true)
    })

    it('should set loading state during closure', async () => {
      let resolvePromise: (value: boolean) => void
      const promise = new Promise<boolean>(resolve => {
        resolvePromise = resolve
      })
      
      mockCloseSession.mockReturnValue(promise)
      
      const store = useCashSessionStore.getState()
      const closePromise = store.closeSession('session-123')
      
      // Check loading state
      expect(useCashSessionStore.getState().loading).toBe(true)
      
      // Resolve the promise
      resolvePromise!(true)
      await closePromise
      
      // Check loading state after completion
      expect(useCashSessionStore.getState().loading).toBe(false)
    })

    it('should clear currentSession and localStorage on successful closure', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'open'
      }
      
      useCashSessionStore.setState({ currentSession: mockSession })

      // Mock localStorage
      const mockRemoveItem = vi.fn()
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: mockRemoveItem
        }
      })
      
      mockCloseSession.mockResolvedValue(true)
      
      const store = useCashSessionStore.getState()
      await store.closeSession('session-123')
      
      expect(useCashSessionStore.getState().currentSession).toBeNull()
      expect(mockRemoveItem).toHaveBeenCalledWith('currentCashSession')
    })

    it('should handle closure error and set error state', async () => {
      const errorMessage = 'Session not found'
      mockCloseSession.mockRejectedValue(new Error(errorMessage))
      
      const store = useCashSessionStore.getState()
      const result = await store.closeSession('session-123')
      
      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe(errorMessage)
      expect(useCashSessionStore.getState().loading).toBe(false)
    })

    it('should handle closure with amounts error', async () => {
      const errorMessage = 'Invalid amount'
      mockCloseSessionWithAmounts.mockRejectedValue(new Error(errorMessage))
      
      const store = useCashSessionStore.getState()
      const result = await store.closeSession('session-123', {
        actual_amount: 75.0,
        variance_comment: 'Test'
      })
      
      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe(errorMessage)
    })

    it('should handle unknown error types', async () => {
      mockCloseSession.mockRejectedValue('Unknown error')
      
      const store = useCashSessionStore.getState()
      const result = await store.closeSession('session-123')
      
      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe('Erreur lors de la fermeture de session')
    })

    it('should not clear session when closure fails', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'open'
      }
      
      useCashSessionStore.setState({ currentSession: mockSession })
      
      mockCloseSession.mockResolvedValue(false)
      
      const store = useCashSessionStore.getState()
      await store.closeSession('session-123')
      
      expect(useCashSessionStore.getState().currentSession).toBe(mockSession)
    })
  })

  describe('submitSale', () => {
    const mockSession = {
      id: 'session-123',
      operator_id: 'operator-1',
      initial_amount: 100,
      current_amount: 100,
      status: 'open' as const,
      opened_at: '2025-01-01T10:00:00Z'
    }

    const mockSaleItems = [
      {
        id: 'item-1',
        category: 'EEE-1',
        quantity: 2,
        weight: 0,
        price: 10,
        total: 20
      },
      {
        id: 'item-2',
        category: 'EEE-2',
        quantity: 1,
        weight: 0,
        price: 15,
        total: 15
      }
    ]

    beforeEach(() => {
      useCashSessionStore.setState({
        currentSession: mockSession,
        currentSaleItems: [],
        currentSaleNote: null,
        loading: false,
        error: null
      })
      mockAxiosPost.mockClear()
    })

    it('should submit sale with overrideTotalAmount when provided', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      const store = useCashSessionStore.getState()
      const finalization = {
        donation: 5,
        paymentMethod: 'cash' as const,
        overrideTotalAmount: 50 // Override: items total = 35, but override = 50
      }

      const result = await store.submitSale(mockSaleItems, finalization)

      expect(result).toBe(true)
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          cash_session_id: 'session-123',
          total_amount: 50, // Should use overrideTotalAmount
          donation: 5,
          payment_method: 'cash',
          items: expect.arrayContaining([
            expect.objectContaining({
              category: 'EEE-1',
              quantity: 2,
              unit_price: 10,
              total_price: 20
            }),
            expect.objectContaining({
              category: 'EEE-2',
              quantity: 1,
              unit_price: 15,
              total_price: 15
            })
          ])
        })
      )
      expect(useCashSessionStore.getState().currentSaleItems).toEqual([])
      expect(useCashSessionStore.getState().currentSaleNote).toBeNull()
      expect(useCashSessionStore.getState().loading).toBe(false)
    })

    it('should submit sale without overrideTotalAmount (standard behavior)', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      const store = useCashSessionStore.getState()
      const finalization = {
        donation: 5,
        paymentMethod: 'card' as const
        // No overrideTotalAmount
      }

      const result = await store.submitSale(mockSaleItems, finalization)

      expect(result).toBe(true)
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          cash_session_id: 'session-123',
          total_amount: 35, // Should calculate: 20 + 15 = 35
          donation: 5,
          payment_method: 'card',
          items: expect.arrayContaining([
            expect.objectContaining({
              category: 'EEE-1',
              quantity: 2,
              unit_price: 10,
              total_price: 20
            }),
            expect.objectContaining({
              category: 'EEE-2',
              quantity: 1,
              unit_price: 15,
              total_price: 15
            })
          ])
        })
      )
    })

    it('should submit sale with overrideTotalAmount = 0 when provided', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      const store = useCashSessionStore.getState()
      const finalization = {
        donation: 0,
        paymentMethod: 'cash' as const,
        overrideTotalAmount: 0 // Edge case: override to 0
      }

      const result = await store.submitSale(mockSaleItems, finalization)

      expect(result).toBe(true)
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          total_amount: 0 // Should use overrideTotalAmount even if 0
        })
      )
    })

    it('should handle error when no current session', async () => {
      useCashSessionStore.setState({ currentSession: null })

      const store = useCashSessionStore.getState()
      const result = await store.submitSale(mockSaleItems)

      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe('Aucune session de caisse active')
      expect(mockAxiosPost).not.toHaveBeenCalled()
    })

    it('should handle API error and set error state', async () => {
      const errorResponse = {
        response: {
          data: {
            detail: 'Validation error: total_amount must be positive'
          }
        }
      }
      mockAxiosPost.mockRejectedValue(errorResponse)

      const store = useCashSessionStore.getState()
      const result = await store.submitSale(mockSaleItems, {
        donation: 0,
        paymentMethod: 'cash'
      })

      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe('Validation error: total_amount must be positive')
      expect(useCashSessionStore.getState().loading).toBe(false)
    })

    it('should handle API error with array detail', async () => {
      const errorResponse = {
        response: {
          data: {
            detail: [
              { loc: ['body', 'total_amount'], msg: 'must be positive' },
              { loc: ['body', 'items'], msg: 'must not be empty' }
            ]
          }
        }
      }
      mockAxiosPost.mockRejectedValue(errorResponse)

      const store = useCashSessionStore.getState()
      const result = await store.submitSale(mockSaleItems)

      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toContain('body.total_amount')
      expect(useCashSessionStore.getState().error).toContain('body.items')
    })

    it('should handle generic error', async () => {
      const genericError = new Error('Network error')
      mockAxiosPost.mockRejectedValue(genericError)

      const store = useCashSessionStore.getState()
      const result = await store.submitSale(mockSaleItems)

      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe('Network error')
    })

    it('should handle unknown error type', async () => {
      mockAxiosPost.mockRejectedValue('Unknown error')

      const store = useCashSessionStore.getState()
      const result = await store.submitSale(mockSaleItems)

      expect(result).toBe(false)
      expect(useCashSessionStore.getState().error).toBe('Erreur lors de l\'enregistrement de la vente')
    })

    it('should set loading state during submission', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise<any>(resolve => {
        resolvePromise = resolve
      })
      mockAxiosPost.mockReturnValue(promise)

      const store = useCashSessionStore.getState()
      const submitPromise = store.submitSale(mockSaleItems)

      // Check loading state
      expect(useCashSessionStore.getState().loading).toBe(true)

      // Resolve the promise
      resolvePromise!({ data: { id: 'sale-123' } })
      await submitPromise

      // Check loading state after completion
      expect(useCashSessionStore.getState().loading).toBe(false)
    })

    it('should include note in finalization when provided', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      useCashSessionStore.setState({ currentSaleNote: 'Test note' })

      const store = useCashSessionStore.getState()
      const finalization = {
        donation: 0,
        paymentMethod: 'cash' as const,
        note: 'Finalization note'
      }

      await store.submitSale(mockSaleItems, finalization)

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          note: 'Finalization note'
        })
      )
    })

    it('should handle items with presetId (UUID)', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      const itemsWithPreset = [
        {
          ...mockSaleItems[0],
          presetId: '550e8400-e29b-41d4-a716-446655440000' // Valid UUID
        }
      ]

      const store = useCashSessionStore.getState()
      await store.submitSale(itemsWithPreset)

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              preset_id: '550e8400-e29b-41d4-a716-446655440000'
            })
          ])
        })
      )
    })

    it('should handle items with presetId (non-UUID) in notes', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      const itemsWithPreset = [
        {
          ...mockSaleItems[0],
          presetId: 'don-0' // Non-UUID preset
        }
      ]

      const store = useCashSessionStore.getState()
      await store.submitSale(itemsWithPreset)

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              preset_id: null,
              notes: 'preset_type:don-0'
            })
          ])
        })
      )
    })

    it('should handle items with both presetId (non-UUID) and notes', async () => {
      const mockResponse = { data: { id: 'sale-123' } }
      mockAxiosPost.mockResolvedValue(mockResponse as any)

      const itemsWithPreset = [
        {
          ...mockSaleItems[0],
          presetId: 'don-18',
          notes: 'User note'
        }
      ]

      const store = useCashSessionStore.getState()
      await store.submitSale(itemsWithPreset)

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/v1/sales/',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              preset_id: null,
              notes: 'preset_type:don-18; User note'
            })
          ])
        })
      )
    })
  })
})