import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { cashSessionService } from '../services/cashSessionService';
import axiosClient from '../api/axiosClient';

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
  presetId?: string;  // ID du preset utilisé pour cet item
  notes?: string;     // Notes pour cet item
}

export interface CashSessionCreate {
  operator_id: string;
  site_id: string;
  register_id?: string;
  initial_amount: number;
}

export interface CashSessionUpdate {
  status?: 'open' | 'closed';
  current_amount?: number;
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
  weight: number;  // Poids en kg
  price: number;
  total: number;
}

export interface SaleCreate {
  cash_session_id: string;
  items: {
    category: string;
    quantity: number;
    weight: number;  // Poids en kg
    unit_price: number;
    total_price: number;
    preset_id?: string | null;  // Story 1.1.2: Preset par item
    notes?: string | null;  // Story 1.1.2: Notes par item
  }[];
  total_amount: number;
  donation?: number;
  payment_method?: string;
  note?: string | null;  // Story B40-P1: Notes sur les tickets de caisse
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
  isScrollable: boolean;
}

interface CashSessionState {
  // State
  currentSession: CashSession | null;
  sessions: CashSession[];
  currentSaleItems: SaleItem[];
  currentSaleNote: string | null;  // Story B40-P1: Notes sur les tickets de caisse
  loading: boolean;
  error: string | null;

  // Scroll state for ticket display
  ticketScrollState: ScrollState;

  // B48-P2: Flag pour tracker si un TICKET_OPENED a été loggé pour la session courante
  // Permet de détecter l'anomalie "ITEM_ADDED_WITHOUT_TICKET"
  ticketOpenedLogged: boolean;

  // Actions
  setCurrentSession: (session: CashSession | null) => void;
  setSessions: (sessions: CashSession[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Sale actions
  addSaleItem: (item: Omit<SaleItem, 'id'>) => void;
  removeSaleItem: (itemId: string) => void;
  updateSaleItem: (itemId: string, newQuantity: number, newWeight: number, newPrice: number, presetId?: string, notes?: string) => void;
  setCurrentSaleNote: (note: string | null) => void;  // Story B40-P1: Notes sur les tickets de caisse
  clearCurrentSale: () => void;
  submitSale: (items: SaleItem[], finalization?: { donation: number; paymentMethod: 'cash'|'card'|'check'; cashGiven?: number; change?: number; note?: string; }) => Promise<boolean>;

  // Scroll actions
  setScrollPosition: (scrollTop: number) => void;
  updateScrollableState: (isScrollable: boolean, canScrollUp: boolean, canScrollDown: boolean, scrollHeight: number, clientHeight: number) => void;
  resetScrollState: () => void;

  // Async actions
  openSession: (data: CashSessionCreate) => Promise<CashSession | null>;
  closeSession: (sessionId: string) => Promise<boolean>;
  updateSession: (sessionId: string, data: CashSessionUpdate) => Promise<boolean>;
  fetchSessions: () => Promise<void>;
  fetchCurrentSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  // UX-B10
  resumeSession: (sessionId: string) => Promise<boolean>;
}

export const useCashSessionStore = create<CashSessionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentSession: null,
        sessions: [],
        currentSaleItems: [],
        currentSaleNote: null,  // Story B40-P1: Notes sur les tickets de caisse
        loading: false,
        error: null,
        ticketOpenedLogged: false,  // B48-P2: Flag pour détecter anomalies (ITEM_ADDED_WITHOUT_TICKET)
        ticketScrollState: {
          scrollTop: 0,
          scrollHeight: 0,
          clientHeight: 0,
          canScrollUp: false,
          canScrollDown: false,
          isScrollable: false
        },

        // Setters
        setCurrentSession: (session) => set({ 
          currentSession: session,
          ticketOpenedLogged: false  // B48-P2: Réinitialiser le flag lors d'un changement de session
        }),
        setSessions: (sessions) => set({ sessions }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Sale actions
        addSaleItem: (item: Omit<SaleItem, 'id'>) => {
          const newItem: SaleItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            presetId: item.presetId,
            notes: item.notes
          };

          const state = get();
          const wasEmpty = state.currentSaleItems.length === 0;
          
          set({
            currentSaleItems: [...state.currentSaleItems, newItem]
          });

          // B48-P2: Détection d'anomalies et logging
          if (state.currentSession) {
            // Import dynamique et appel asynchrone (fire-and-forget)
            import('../services/transactionLogService').then(({ transactionLogService }) => {
              const cartState = {
                items_count: state.currentSaleItems.length + 1,  // +1 car on vient d'ajouter l'item
                items: [...state.currentSaleItems, newItem].map(item => ({
                  id: item.id,
                  category: item.category,
                  weight: item.weight,
                  price: item.total
                })),
                total: [...state.currentSaleItems, newItem].reduce((sum, item) => sum + item.total, 0)
              };

              // Détecter anomalie: si un item est ajouté alors qu'aucun TICKET_OPENED n'a été loggé
              // pour cette session (AC #3: "Si une action 'Ajout Item' arrive alors qu'aucun ticket n'est explicitement 'ouvert'")
              if (!state.ticketOpenedLogged) {
                // Anomalie détectée: ITEM_ADDED_WITHOUT_TICKET
                transactionLogService.logAnomaly(
                  state.currentSession!.id,
                  cartState,
                  "Item added but no ticket is explicitly opened"
                ).catch((err) => {
                  console.error('[TransactionLog] Erreur lors du log ANOMALY_DETECTED:', err);
                });

                // Logger aussi TICKET_OPENED pour marquer l'ouverture du ticket (même si c'est une anomalie)
                // Cela permet de suivre l'état du ticket même en cas d'anomalie
                transactionLogService.logTicketOpened(
                  state.currentSession!.id,
                  cartState,
                  true // Anomalie: ticket ouvert implicitement
                ).then(() => {
                  // Marquer que TICKET_OPENED a été loggé
                  set({ ticketOpenedLogged: true });
                }).catch((err) => {
                  console.error('[TransactionLog] Erreur lors du log TICKET_OPENED:', err);
                });
              } else if (wasEmpty) {
                // Cas normal: panier était vide, on ouvre un nouveau ticket
                // (TICKET_OPENED a déjà été loggé précédemment, donc pas d'anomalie)
                transactionLogService.logTicketOpened(
                  state.currentSession!.id,
                  cartState,
                  false // Pas d'anomalie
                ).then(() => {
                  // Marquer que TICKET_OPENED a été loggé
                  set({ ticketOpenedLogged: true });
                }).catch((err) => {
                  console.error('[TransactionLog] Erreur lors du log TICKET_OPENED:', err);
                });
              }
              // Si le panier n'était pas vide et qu'un TICKET_OPENED a déjà été loggé,
              // c'est normal (ajout d'item à un ticket existant), pas besoin de logger
            }).catch((err) => {
              console.error('[TransactionLog] Erreur lors de l\'import du service:', err);
            }); // Logger les erreurs d'import pour diagnostic
          }
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
                    total: newQuantity * newPrice,  // total = quantité × prix
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
          const state = get();
          const cartStateBefore = state.currentSaleItems.length > 0 ? {
            items_count: state.currentSaleItems.length,
            items: state.currentSaleItems.map(item => ({
              id: item.id,
              category: item.category,
              weight: item.weight,
              price: item.total
            })),
            total: state.currentSaleItems.reduce((sum, item) => sum + item.total, 0)
          } : undefined;

          set({
            currentSaleItems: [],
            currentSaleNote: null,  // Story B40-P1: Réinitialiser la note lors du clear
            ticketOpenedLogged: false,  // B48-P2: Réinitialiser le flag lors du reset
            ticketScrollState: {
              scrollTop: 0,
              scrollHeight: 0,
              clientHeight: 0,
              canScrollUp: false,
              canScrollDown: false,
              isScrollable: false
            }
          });

          // B48-P2: Logger TICKET_RESET avec l'état du panier avant le reset
          if (cartStateBefore && state.currentSession) {
            // Import dynamique et appel asynchrone (fire-and-forget)
            import('../services/transactionLogService').then(({ transactionLogService }) => {
              // Détecter anomalie: si le panier n'était pas vide alors qu'il aurait dû l'être
              // (mais en fait, c'est normal de reset un panier non vide)
              transactionLogService.logTicketReset(
                state.currentSession!.id,
                cartStateBefore,
                false // Pas d'anomalie par défaut
              ).catch((err) => {
                console.error('[TransactionLog] Erreur lors du log TICKET_RESET:', err);
              }); // Logger les erreurs pour diagnostic
            }).catch((err) => {
              console.error('[TransactionLog] Erreur lors de l\'import du service:', err);
            }); // Logger les erreurs d'import pour diagnostic
          }
        },

        // Scroll actions
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
            // Fonction pour valider si une chaîne est un UUID valide
            const isValidUUID = (str: string | undefined | null): boolean => {
              if (!str) return false;
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              return uuidRegex.test(str);
            };

            const saleData: SaleCreate = {
              cash_session_id: currentSession.id,
              items: items.map(item => {
                // Si presetId n'est pas un UUID valide (comme "don-0", "don-18", etc.), 
                // on le stocke dans notes pour préserver l'information du type de preset
                const presetId = item.presetId && isValidUUID(item.presetId) ? item.presetId : null;
                let notes = item.notes || null;
                
                // Si presetId n'est pas un UUID valide, l'ajouter dans notes pour traçabilité
                if (item.presetId && !isValidUUID(item.presetId)) {
                  const presetTypeNote = `preset_type:${item.presetId}`;
                  notes = notes ? `${presetTypeNote}; ${notes}` : presetTypeNote;
                }
                
                return {
                  category: item.category,
                  quantity: item.quantity,
                  weight: item.weight,  // Ajout du poids
                  unit_price: item.price,
                  total_price: item.total,
                  preset_id: presetId,  // UUID valide ou null
                  notes: notes  // Notes utilisateur + type de preset si non-UUID
                };
              }),
              total_amount: items.reduce((sum, item) => sum + item.total, 0)
            };

            // Étendre le payload pour inclure finalisation (don, paiement)
            // Story 1.1.2: preset_id et notes sont maintenant par item, pas au niveau vente globale
            // Story B40-P1: note au niveau ticket (pas au niveau item)
            // Les codes de paiement sont maintenant simples (cash/card/check) pour éviter problèmes d'encodage
            const { currentSaleNote } = get();
            const extendedPayload = {
              ...saleData,
              donation: finalization?.donation ?? 0,
              payment_method: finalization?.paymentMethod ?? 'cash',  // Envoie directement cash/card/check
              note: finalization?.note || null,  // Story B40-P1-CORRECTION: Notes déplacées vers popup de paiement
              // preset_id et notes supprimés du niveau vente - maintenant dans chaque item
            };

            // Call API to create sale using axiosClient (handles auth automatically)
            const response = await axiosClient.post('/v1/sales/', extendedPayload);

            // Clear current sale on success
            set({
              currentSaleItems: [],
              currentSaleNote: null,  // Story B40-P1: Réinitialiser la note après soumission réussie
              loading: false
            });

            return true;
          } catch (error: any) {
            // Extraire le détail de l'erreur de validation Pydantic si disponible
            let errorMessage = 'Erreur lors de l\'enregistrement de la vente';
            if (error?.response?.data?.detail) {
              const detail = error.response.data.detail;
              if (Array.isArray(detail)) {
                // Erreur de validation Pydantic avec plusieurs champs
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
        openSession: async (data: CashSessionCreate): Promise<CashSession | null> => {
          set({ loading: true, error: null });
          
          try {
            // Pré-check 1: vérifier s'il y a déjà une session ouverte sur ce poste de caisse
            if (data.register_id) {
              const status = await cashSessionService.getRegisterSessionStatus(data.register_id);
              if (status.is_active && status.session_id) {
                const existingByRegister = await cashSessionService.getSession(status.session_id);
                if (existingByRegister) {
                  set({ currentSession: existingByRegister, loading: false });
                  localStorage.setItem('currentCashSession', JSON.stringify(existingByRegister));
                  return existingByRegister;
                }
              }
            }

            // Pré-check 2: session ouverte pour l'opérateur courant (fallback)
            const existing = await cashSessionService.getCurrentSession();
            if (existing) {
              set({ currentSession: existing, loading: false });
              localStorage.setItem('currentCashSession', JSON.stringify(existing));
              return existing;
            }

            const session = await cashSessionService.createSession(data);
            set({ 
              currentSession: session, 
              loading: false 
            });
            
            // Sauvegarder en local pour la persistance
            localStorage.setItem('currentCashSession', JSON.stringify(session));
            
            return session;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ouverture de session';
            
            // Si l'API renvoie que la session est déjà ouverte, tenter de reprendre automatiquement
            if (data.register_id && /déjà ouverte|already open/i.test(errorMessage)) {
              try {
                const status = await cashSessionService.getRegisterSessionStatus(data.register_id);
                if (status.is_active && status.session_id) {
                  const existing = await cashSessionService.getSession(status.session_id);
                  if (existing) {
                    set({ currentSession: existing, loading: false });
                    localStorage.setItem('currentCashSession', JSON.stringify(existing));
                    return existing;
                  }
                }
              } catch {
                // ignore and fall through
              }
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
              // Fermeture avec contrôle des montants
              const closedSession = await cashSessionService.closeSessionWithAmounts(
                sessionId, 
                closeData.actual_amount, 
                closeData.variance_comment
              );
              // B44-P3: closedSession peut être null si la session était vide et a été supprimée
              // null = session supprimée (succès), CashSession = session fermée (succès)
              // Si on arrive ici sans exception, c'est toujours un succès
              success = true;
            } else {
              // Fermeture simple
              success = await cashSessionService.closeSession(sessionId);
            }
            
            if (success) {
              set({ 
                currentSession: null, 
                loading: false 
              });
              
              // Supprimer de la persistance locale
              localStorage.removeItem('currentCashSession');
            }
            
            return success;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la fermeture de session';
            set({ error: errorMessage, loading: false });
            return false;
          }
        },

        updateSession: async (sessionId: string, data: CashSessionUpdate): Promise<boolean> => {
          set({ loading: true, error: null });
          
          try {
            const updatedSession = await cashSessionService.updateSession(sessionId, data);
            
            if (updatedSession) {
              const { currentSession } = get();
              
              // Mettre à jour la session courante si c'est la même
              if (currentSession && currentSession.id === sessionId) {
                set({ 
                  currentSession: updatedSession, 
                  loading: false 
                });
                
                // Mettre à jour la persistance locale
                localStorage.setItem('currentCashSession', JSON.stringify(updatedSession));
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
            // Essayer de récupérer depuis le localStorage d'abord
            const localSession = localStorage.getItem('currentCashSession');
            if (localSession) {
              const session = JSON.parse(localSession);
              
              // Vérifier que la session est toujours ouverte côté serveur
              const serverSession = await cashSessionService.getSession(session.id);
              if (serverSession && serverSession.status === 'open') {
                set({ currentSession: serverSession, loading: false });
                return;
              } else {
                // Session fermée côté serveur, nettoyer le localStorage
                localStorage.removeItem('currentCashSession');
              }
            }
            // Pas de session locale: interroger l'API pour la session courante de l'opérateur
            const current = await cashSessionService.getCurrentSession();
            if (current && current.status === 'open') {
              set({ currentSession: current, loading: false });
              localStorage.setItem('currentCashSession', JSON.stringify(current));
              return;
            }

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

        // UX-B10: reprendre une session existante
        resumeSession: async (sessionId: string): Promise<boolean> => {
          set({ loading: true, error: null });
          try {
            const session = await cashSessionService.getSession(sessionId);
            if (session && session.status === 'open') {
              set({ currentSession: session, loading: false });
              localStorage.setItem('currentCashSession', JSON.stringify(session));
              return true;
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
        name: 'cash-session-store',
        partialize: (state) => ({
          currentSession: state.currentSession,
          currentSaleItems: state.currentSaleItems
        })
      }
    ),
    {
      name: 'cash-session-store'
    }
  )
);

export default useCashSessionStore;
