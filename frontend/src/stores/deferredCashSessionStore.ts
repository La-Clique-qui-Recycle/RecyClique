import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { cashSessionService } from '../services/cashSessionService';
import axiosClient from '../api/axiosClient';
import { getCashRegister, getSites } from '../services/api';  // B49-P3: Pour charger les options de workflow depuis la caisse source

// Réutiliser les interfaces du store normal
export interface CashSession {
  id: string;
  operator_id: string;
  initial_amount: number;
  current_amount: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  total_sales?: number;
  total_items?: number;
}

export interface SaleItem {
  id: string;
  category: string;
  subcategory?: string;
  categoryName?: string;
  subcategoryName?: string;
  quantity: number;
  weight: number;
  price: number;
  total: number;
  presetId?: string;
  notes?: string;
}

export interface CashSessionCreate {
  operator_id: string;
  site_id: string;
  register_id?: string;
  initial_amount: number;
  opened_at?: string;  // B44-P1: Date de session pour saisie différée
}

export interface SaleCreate {
  cash_session_id: string;
  items: {
    category: string;
    quantity: number;
    weight: number;
    unit_price: number;
    total_price: number;
    preset_id?: string | null;
    notes?: string | null;
  }[];
  total_amount: number;
  donation?: number;
  payment_method?: string;
  note?: string | null;
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
  isScrollable: boolean;
}

interface DeferredCashSessionState {
  // State
  currentSession: CashSession | null;
  sessions: CashSession[];
  currentSaleItems: SaleItem[];
  currentSaleNote: string | null;
  loading: boolean;
  error: string | null;
  openedAt: string | null;  // B44-P1: Date de session différée

  // Scroll state for ticket display
  ticketScrollState: ScrollState;

  // B49-P3: Options de workflow héritées de la caisse source
  currentRegisterOptions: Record<string, any> | null;

  // Actions
  setCurrentSession: (session: CashSession | null) => void;
  setSessions: (sessions: CashSession[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setOpenedAt: (date: string | null) => void;  // B44-P1: Définir la date de session
  setCurrentRegisterOptions: (options: Record<string, any> | null) => void;  // B49-P3: Définir les options héritées

  // Sale actions
  addSaleItem: (item: Omit<SaleItem, 'id'>) => void;
  removeSaleItem: (itemId: string) => void;
  updateSaleItem: (itemId: string, newQuantity: number, newWeight: number, newPrice: number, presetId?: string, notes?: string) => void;
  setCurrentSaleNote: (note: string | null) => void;
  clearCurrentSale: () => void;
  submitSale: (items: SaleItem[], finalization?: { donation: number; paymentMethod: 'cash'|'card'|'check'; cashGiven?: number; change?: number; note?: string; }) => Promise<boolean>;

  // Scroll actions
  setScrollPosition: (scrollTop: number) => void;
  updateScrollableState: (isScrollable: boolean, canScrollUp: boolean, canScrollDown: boolean, scrollHeight: number, clientHeight: number) => void;
  resetScrollState: () => void;

  // Async actions
  openSession: (data: CashSessionCreate & { opened_at?: string }) => Promise<CashSession | null>;
  closeSession: (sessionId: string) => Promise<boolean>;
  updateSession: (sessionId: string, data: Partial<CashSession>) => Promise<boolean>;
  fetchSessions: () => Promise<void>;
  fetchCurrentSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<boolean>;
}

export const useDeferredCashSessionStore = create<DeferredCashSessionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentSession: null,
        sessions: [],
        currentSaleItems: [],
        currentSaleNote: null,
        loading: false,
        error: null,
        openedAt: null,  // B44-P1: Date de session différée
        currentRegisterOptions: null,  // B49-P3: Options de workflow héritées de la caisse source
        ticketScrollState: {
          scrollTop: 0,
          scrollHeight: 0,
          clientHeight: 0,
          canScrollUp: false,
          canScrollDown: false,
          isScrollable: false
        },

        // Setters
        setCurrentSession: (session) => set({ currentSession: session }),
        setSessions: (sessions) => set({ sessions }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        setOpenedAt: (date) => set({ openedAt: date }),  // B44-P1
        setCurrentRegisterOptions: (options) => set({ currentRegisterOptions: options }),  // B49-P3: Définir les options héritées

        // Sale actions (identique au store normal)
        addSaleItem: (item: Omit<SaleItem, 'id'>) => {
          const newItem: SaleItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            presetId: item.presetId,
            notes: item.notes
          };

          set((state) => ({
            currentSaleItems: [...state.currentSaleItems, newItem]
          }));
        },

        removeSaleItem: (itemId: string) => {
          set((state) => ({
            currentSaleItems: state.currentSaleItems.filter(item => item.id !== itemId)
          }));
        },

        updateSaleItem: (itemId: string, newQuantity: number, newWeight: number, newPrice: number, presetId?: string, notes?: string) => {
          set((state) => ({
            currentSaleItems: state.currentSaleItems.map(item =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: newQuantity,
                    weight: newWeight,
                    price: newPrice,
                    total: newQuantity * newPrice,
                    presetId: presetId !== undefined ? presetId : item.presetId,
                    notes: notes !== undefined ? notes : item.notes
                  }
                : item
            )
          }));
        },

        setCurrentSaleNote: (note: string | null) => {
          set({ currentSaleNote: note });
        },

        clearCurrentSale: () => {
          set({
            currentSaleItems: [],
            currentSaleNote: null,
            ticketScrollState: {
              scrollTop: 0,
              scrollHeight: 0,
              clientHeight: 0,
              canScrollUp: false,
              canScrollDown: false,
              isScrollable: false
            }
          });
        },

        // Scroll actions (identique au store normal)
        setScrollPosition: (scrollTop: number) => {
          set((state) => ({
            ticketScrollState: {
              ...state.ticketScrollState,
              scrollTop,
              canScrollUp: scrollTop > 0,
              canScrollDown: scrollTop < state.ticketScrollState.scrollHeight - state.ticketScrollState.clientHeight - 1
            }
          }));
        },

        updateScrollableState: (isScrollable: boolean, canScrollUp: boolean, canScrollDown: boolean, scrollHeight: number, clientHeight: number) => {
          set((state) => ({
            ticketScrollState: {
              ...state.ticketScrollState,
              isScrollable,
              canScrollUp,
              canScrollDown,
              scrollHeight,
              clientHeight
            }
          }));
        },

        resetScrollState: () => {
          set({
            ticketScrollState: {
              scrollTop: 0,
              scrollHeight: 0,
              clientHeight: 0,
              canScrollUp: false,
              canScrollDown: false,
              isScrollable: false
            }
          });
        },

        submitSale: async (items: SaleItem[], finalization?: { donation: number; paymentMethod: 'cash'|'card'|'check'; cashGiven?: number; change?: number; note?: string; }): Promise<boolean> => {
          const { currentSession } = get();

          if (!currentSession) {
            const errorMsg = 'Aucune session de caisse active';
            console.error('[submitSale]', errorMsg);
            set({ error: errorMsg });
            return false;
          }

          set({ loading: true, error: null });

          try {
            const isValidUUID = (str: string | undefined | null): boolean => {
              if (!str) return false;
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              return uuidRegex.test(str);
            };

            const saleData: SaleCreate = {
              cash_session_id: currentSession.id,
              items: items.map(item => {
                const presetId = item.presetId && isValidUUID(item.presetId) ? item.presetId : null;
                let notes = item.notes || null;
                
                if (item.presetId && !isValidUUID(item.presetId)) {
                  const presetTypeNote = `preset_type:${item.presetId}`;
                  notes = notes ? `${presetTypeNote}; ${notes}` : presetTypeNote;
                }
                
                return {
                  category: item.category,
                  quantity: item.quantity,
                  weight: item.weight,
                  unit_price: item.price,
                  total_price: item.total,
                  preset_id: presetId,
                  notes: notes
                };
              }),
              total_amount: items.reduce((sum, item) => sum + item.total, 0)
            };

            const { currentSaleNote } = get();
            const extendedPayload = {
              ...saleData,
              donation: finalization?.donation ?? 0,
              payment_method: finalization?.paymentMethod ?? 'cash',
              note: finalization?.note || null,
            };

            // Call API to create sale using axiosClient (handles auth automatically)
            const response = await axiosClient.post('/v1/sales/', extendedPayload);

            // Clear current sale on success
            set({
              currentSaleItems: [],
              currentSaleNote: null,
              loading: false
            });

            return true;
          } catch (error: any) {
            let errorMessage = 'Erreur lors de l\'enregistrement de la vente';
            if (error?.response?.data?.detail) {
              const detail = error.response.data.detail;
              if (Array.isArray(detail)) {
                const errors = detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ');
                errorMessage = `Erreur de validation: ${errors}`;
              } else if (typeof detail === 'string') {
                errorMessage = detail;
              }
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            console.error('[submitSale] Error:', errorMessage);
            set({ error: errorMessage, loading: false });
            return false;
          }
        },

        // Async actions
        openSession: async (data: CashSessionCreate & { opened_at?: string }): Promise<CashSession | null> => {
          set({ loading: true, error: null });
          
          try {
            // Validation: s'assurer que initial_amount est un number valide
            const initialAmount = typeof data.initial_amount === 'number' 
              ? data.initial_amount 
              : parseFloat(String(data.initial_amount || '0').replace(',', '.'));
            
            if (isNaN(initialAmount) || initialAmount < 0) {
              const errorMsg = 'Montant initial invalide';
              set({ error: errorMsg, loading: false });
              return null;
            }

            // Stocker la date de session si fournie
            if (data.opened_at) {
              set({ openedAt: data.opened_at });
            }

            // B49-P3: Charger les options de workflow depuis la caisse source si register_id est présent
            let registerOptions: Record<string, any> | null = null;
            if (data.register_id) {
              try {
                const register = await getCashRegister(data.register_id);
                if (register?.workflow_options) {
                  registerOptions = register.workflow_options;
                  console.log('[DeferredCashStore] Options héritées de la caisse source:', registerOptions);
                }
              } catch (error) {
                console.warn('[DeferredCashStore] Impossible de charger les options de la caisse source:', error);
              }
            }

            // B44-P1: En mode différé, ne pas vérifier les sessions existantes
            // On veut toujours créer une nouvelle session avec la date spécifiée
            // B44-P1: En mode différé, ne JAMAIS réutiliser une session existante
            // Même si pas de date fournie, on crée une nouvelle session pour éviter le mélange
            // Ne pas vérifier getCurrentSession() car cela pourrait retourner une session normale

            // Créer la session avec opened_at si fourni
            // Si site_id n'est pas fourni (undefined, null, ou chaîne vide), essayer de le récupérer depuis register_id
            let siteId = data.site_id && data.site_id.trim() !== '' ? data.site_id : undefined;
            if (!siteId && data.register_id) {
              try {
                const register = await getCashRegister(data.register_id);
                if (register?.site_id) {
                  siteId = register.site_id;
                }
              } catch (error) {
                console.warn('[DeferredCashStore] Impossible de charger le register pour obtenir site_id:', error);
              }
            }
            
            // Si toujours pas de site_id, utiliser le premier site disponible (fallback)
            if (!siteId) {
              try {
                console.log('[DeferredCashStore] Tentative de récupération du site par défaut...');
                const sites = await getSites();
                console.log('[DeferredCashStore] Sites récupérés:', sites);
                if (sites && sites.length > 0) {
                  siteId = sites[0].id;
                  console.log('[DeferredCashStore] Utilisation du site par défaut:', siteId);
                } else {
                  console.warn('[DeferredCashStore] Aucun site disponible dans la liste');
                }
              } catch (error) {
                console.error('[DeferredCashStore] Erreur lors du chargement des sites:', error);
              }
            }
            
            if (!siteId) {
              const errorMsg = 'Impossible de déterminer le site pour la session différée. Veuillez contacter un administrateur.';
              console.error('[DeferredCashStore]', errorMsg);
              set({ error: errorMsg, loading: false });
              return null;
            }

            const sessionData: any = {
              operator_id: data.operator_id,
              site_id: siteId,  // siteId est toujours défini à ce point (vérifié plus haut)
              initial_amount: initialAmount,
            };
            
            // Ajouter register_id seulement s'il n'est pas vide
            if (data.register_id && data.register_id.trim() !== '') {
              sessionData.register_id = data.register_id;
            }
            
            if (data.opened_at) {
              sessionData.opened_at = data.opened_at;
            }

            console.log('[openSession] Creating session with data:', sessionData);

            const session = await cashSessionService.createSession(sessionData);
            
            if (!session) {
              throw new Error('La création de session a échoué sans erreur explicite');
            }

            console.log('[openSession] Session created:', session);
            
            set({ 
              currentSession: session,
              currentRegisterOptions: registerOptions,  // B49-P3: Stocker les options héritées
              loading: false 
            });
            
            // B44-P1: Utiliser une clé localStorage différente pour éviter le mélange avec les sessions normales
            localStorage.setItem('deferredCashSession', JSON.stringify(session));
            
            return session;
          } catch (error: any) {
            console.error('[openSession] Error:', error);
            let errorMessage = 'Erreur lors de l\'ouverture de session';
            
            if (error?.response?.data?.detail) {
              const detail = error.response.data.detail;
              if (Array.isArray(detail)) {
                const errors = detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ');
                errorMessage = `Erreur de validation: ${errors}`;
              } else if (typeof detail === 'string') {
                errorMessage = detail;
              }
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            
            set({ error: errorMessage, loading: false });
            return null;
          }
        },

        closeSession: async (sessionId: string, closeData?: { actual_amount: number; variance_comment?: string }): Promise<boolean> => {
          set({ loading: true, error: null });
          
          try {
            let success: boolean;
            
            if (closeData) {
              const closedSession = await cashSessionService.closeSessionWithAmounts(
                sessionId, 
                closeData.actual_amount, 
                closeData.variance_comment
              );
              success = !!closedSession;
            } else {
              success = await cashSessionService.closeSession(sessionId);
            }
            
            if (success) {
              set({ 
                currentSession: null, 
                loading: false,
                openedAt: null  // B44-P1: Réinitialiser la date de session
              });
              
              // B44-P1: Utiliser la clé localStorage spécifique au mode différé
              localStorage.removeItem('deferredCashSession');
            }
            
            return success;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la fermeture de session';
            set({ error: errorMessage, loading: false });
            return false;
          }
        },

        updateSession: async (sessionId: string, data: Partial<CashSession>): Promise<boolean> => {
          set({ loading: true, error: null });
          
          try {
            const updatedSession = await cashSessionService.updateSession(sessionId, data);
            
            if (updatedSession) {
              const { currentSession } = get();
              
              if (currentSession && currentSession.id === sessionId) {
                set({ 
                  currentSession: updatedSession, 
                  loading: false 
                });
                
                // B44-P1: Utiliser la clé localStorage spécifique au mode différé
                localStorage.setItem('deferredCashSession', JSON.stringify(updatedSession));
              }
            }
            
            return !!updatedSession;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de session';
            set({ error: errorMessage, loading: false });
            return false;
          }
        },

        fetchSessions: async (): Promise<void> => {
          set({ loading: true, error: null });
          
          try {
            const sessions = await cashSessionService.getSessions();
            set({ sessions, loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des sessions';
            set({ error: errorMessage, loading: false });
          }
        },

        fetchCurrentSession: async (): Promise<void> => {
          set({ loading: true, error: null });
          
          try {
            // B44-P1: Utiliser la clé localStorage spécifique au mode différé
            const localSession = localStorage.getItem('deferredCashSession');
            if (localSession) {
              const session = JSON.parse(localSession);
              
              // Vérifier d'abord si la session locale est fermée
              if (session.status !== 'open') {
                console.warn('[fetchCurrentSession] Session locale fermée, nettoyage localStorage');
                localStorage.removeItem('deferredCashSession');
                set({ currentSession: null, loading: false });
                return;
              }
              
              const serverSession = await cashSessionService.getSession(session.id);
              if (serverSession && serverSession.status === 'open') {
                // B44-P1: Vérifier que c'est bien une session différée (opened_at dans le passé)
                const openedAtDate = new Date(serverSession.opened_at);
                const now = new Date();
                if (openedAtDate < now) {
                  set({ currentSession: serverSession, loading: false, openedAt: serverSession.opened_at });
                  return;
                } else {
                  // Session normale trouvée, ne pas l'utiliser en mode différé
                  console.warn('[fetchCurrentSession] Session normale trouvée, nettoyage localStorage');
                  localStorage.removeItem('deferredCashSession');
                }
              } else {
                // Session fermée sur le serveur ou inexistante
                console.warn('[fetchCurrentSession] Session fermée ou inexistante sur le serveur, nettoyage localStorage');
                localStorage.removeItem('deferredCashSession');
              }
            }
            
            // B44-P1: Ne PAS appeler getCurrentSession() car cela pourrait retourner une session normale
            // En mode différé, on ne récupère que les sessions différées explicitement
            set({ currentSession: null, loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération de la session';
            set({ error: errorMessage, loading: false });
          }
        },

        refreshSession: async (): Promise<void> => {
          const { currentSession } = get();
          if (currentSession) {
            await get().fetchCurrentSession();
          }
        },

        resumeSession: async (sessionId: string): Promise<boolean> => {
          set({ loading: true, error: null });
          try {
            const session = await cashSessionService.getSession(sessionId);
            if (session && session.status === 'open') {
              // B44-P1: Vérifier que c'est bien une session différée (opened_at dans le passé)
              const openedAtDate = new Date(session.opened_at);
              const now = new Date();
              if (openedAtDate < now) {
                set({ currentSession: session, loading: false, openedAt: session.opened_at });
                localStorage.setItem('deferredCashSession', JSON.stringify(session));
                return true;
              } else {
                // Session normale, ne pas l'utiliser en mode différé
                set({ loading: false, error: "Cette session n'est pas une session différée" });
                return false;
              }
            }
            set({ loading: false, error: "Aucune session ouverte trouvée pour cet identifiant" });
            return false;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la reprise de session';
            set({ error: errorMessage, loading: false });
            return false;
          }
        }
      }),
      {
        name: 'deferred-cash-session-store',
        partialize: (state) => ({
          currentSession: state.currentSession,
          currentSaleItems: state.currentSaleItems,
          openedAt: state.openedAt  // B44-P1: Persister la date de session
        }),
        // B44-P1: Valider la session restaurée depuis localStorage
        onRehydrateStorage: () => (state) => {
          if (state?.currentSession) {
            // Vérifier que la session est OUVERTE
            if (state.currentSession.status !== 'open') {
              // Session fermée, la supprimer
              console.warn('[deferredCashSessionStore] Session fermée restaurée, suppression');
              state.setCurrentSession(null);
              state.setOpenedAt(null);
              localStorage.removeItem('deferredCashSession');
              return;
            }
            
            // Vérifier que c'est bien une session différée
            if (state.currentSession.opened_at) {
              const openedAtDate = new Date(state.currentSession.opened_at);
              const now = new Date();
              if (openedAtDate >= now) {
                // Session normale trouvée, la supprimer
                console.warn('[deferredCashSessionStore] Session normale restaurée, suppression');
                state.setCurrentSession(null);
                state.setOpenedAt(null);
                localStorage.removeItem('deferredCashSession');
              }
            } else {
              // Session sans opened_at, la supprimer
              console.warn('[deferredCashSessionStore] Session sans opened_at restaurée, suppression');
              state.setCurrentSession(null);
              state.setOpenedAt(null);
              localStorage.removeItem('deferredCashSession');
            }
          }
        }
      }
    ),
    {
      name: 'deferred-cash-session-store'
    }
  )
);

export default useDeferredCashSessionStore;

