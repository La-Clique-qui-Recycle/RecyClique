import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCashSessionStore } from '../stores/cashSessionStore';
import { useVirtualCashSessionStore } from '../stores/virtualCashSessionStore';
import { useDeferredCashSessionStore } from '../stores/deferredCashSessionStore';  // B44-P1
import { useCategoryStore } from '../stores/categoryStore';
import { useVirtualCategoryStore } from '../stores/virtualCategoryStore';
import { usePresetStore } from '../stores/presetStore';
import { useVirtualPresetStore } from '../stores/virtualPresetStore';

/**
 * Interface pour les stores injectés
 * Permet de basculer entre mode réel, virtuel et différé de manière transparente
 */
export interface CashStoreContextValue {
  // Stores de session de caisse
  cashSessionStore: ReturnType<typeof useCashSessionStore>;
  categoryStore: ReturnType<typeof useCategoryStore>;
  presetStore: ReturnType<typeof usePresetStore>;
  
  // Mode actuel
  isVirtualMode: boolean;
  isDeferredMode: boolean;  // B44-P1: Mode saisie différée
  
  // Actions pour basculer le mode
  enableVirtualMode: () => void;
  disableVirtualMode: () => void;
}

const CashStoreContext = createContext<CashStoreContextValue | null>(null);

interface CashStoreProviderProps {
  children: ReactNode;
  /**
   * Mode par défaut : 'real' ou 'virtual'
   * Si non spécifié, détecte automatiquement depuis l'URL ou le store
   */
  defaultMode?: 'real' | 'virtual';
  /**
   * Force le mode (ignore la détection automatique)
   */
  forceMode?: 'real' | 'virtual';
}

/**
 * Provider qui injecte les stores appropriés selon le mode (réel ou virtuel)
 * 
 * Usage:
 * ```tsx
 * <CashStoreProvider defaultMode="virtual">
 *   <Sale />
 * </CashStoreProvider>
 * ```
 */
export const CashStoreProvider: React.FC<CashStoreProviderProps> = ({
  children,
  defaultMode,
  forceMode
}) => {
  // Utiliser useLocation pour détecter les changements d'URL en temps réel
  const location = useLocation();
  
  // B44-P1: Détecter le mode différé depuis l'URL
  const isDeferredFromUrl = location.pathname.includes('/cash-register/deferred');
  
  // Détecter le mode depuis l'URL si non forcé
  // /caisse = toujours mode réel (même si /virtual est dans l'URL ailleurs)
  // /cash-register/virtual = mode virtuel
  // /cash-register/deferred = mode saisie différée
  const isVirtualFromUrl = location.pathname.includes('/virtual') &&
    !location.pathname.startsWith('/caisse') &&
    !isDeferredFromUrl;
  
  // Détecter le mode depuis le store virtuel
  const virtualStore = useVirtualCashSessionStore();
  const isVirtualFromStore = virtualStore.isVirtualMode;
  
  // Déterminer le mode final
  // PRIORITÉ : forceMode > defaultMode > URL > Store
  const isVirtualMode = useMemo(() => {
    if (isDeferredFromUrl) {
      return false;  // Mode différé n'est pas virtuel
    }
    if (forceMode !== undefined) {
      return forceMode === 'virtual';
    }
    if (defaultMode !== undefined) {
      return defaultMode === 'virtual';
    }
    // Si l'URL contient /caisse, forcer le mode réel (même si le store est en mode virtuel)
    if (location.pathname.startsWith('/caisse')) {
      return false;
    }
    return isVirtualFromUrl || isVirtualFromStore;
  }, [forceMode, defaultMode, isVirtualFromUrl, isVirtualFromStore, location.pathname, isDeferredFromUrl]);
  
  // B44-P1: Mode différé
  const isDeferredMode = isDeferredFromUrl;

  // Activer/désactiver le mode virtuel dans le store
  React.useEffect(() => {
    if (isVirtualMode && !isVirtualFromStore) {
      virtualStore.enableVirtualMode();
    } else if (!isVirtualMode && isVirtualFromStore) {
      virtualStore.disableVirtualMode();
    }
  }, [isVirtualMode, isVirtualFromStore]); // Retirer virtualStore des dépendances pour éviter la boucle

  // Stores réels
  const realCashSessionStore = useCashSessionStore();
  const realCategoryStore = useCategoryStore();
  const realPresetStore = usePresetStore();

  // Stores virtuels
  const virtualCashSessionStore = useVirtualCashSessionStore();
  const virtualCategoryStore = useVirtualCategoryStore();
  const virtualPresetStore = useVirtualPresetStore();

  // B44-P1: Store différé (saisie différée)
  const deferredCashSessionStore = useDeferredCashSessionStore();

  // Initialiser les données virtuelles si nécessaire (une seule fois)
  const hasInitializedRef = React.useRef(false);
  React.useEffect(() => {
    if (isVirtualMode && !hasInitializedRef.current) {
      virtualCategoryStore.initializeVirtualData();
      virtualPresetStore.initializeVirtualData();
      hasInitializedRef.current = true;
    } else if (!isVirtualMode) {
      hasInitializedRef.current = false;
    }
  }, [isVirtualMode]); // Seulement dépendre de isVirtualMode

  // Sélectionner les stores selon le mode
  const contextValue = useMemo<CashStoreContextValue>(() => ({
    cashSessionStore: isDeferredMode ? deferredCashSessionStore : (isVirtualMode ? virtualCashSessionStore : realCashSessionStore),
    categoryStore: isVirtualMode ? virtualCategoryStore : realCategoryStore,
    presetStore: isVirtualMode ? virtualPresetStore : realPresetStore,
    isVirtualMode,
    isDeferredMode,  // B44-P1
    enableVirtualMode: () => virtualStore.enableVirtualMode(),
    disableVirtualMode: () => virtualStore.disableVirtualMode()
  }), [
    isVirtualMode,
    isDeferredMode,  // B44-P1
    realCashSessionStore,
    virtualCashSessionStore,
    deferredCashSessionStore,  // B44-P1
    realCategoryStore,
    virtualCategoryStore,
    realPresetStore,
    virtualPresetStore,
    virtualStore
  ]);

  return (
    <CashStoreContext.Provider value={contextValue}>
      {children}
    </CashStoreContext.Provider>
  );
};

/**
 * Hook pour accéder aux stores injectés
 * 
 * Usage:
 * ```tsx
 * const { cashSessionStore, isVirtualMode } = useCashStores();
 * const { currentSession } = cashSessionStore;
 * ```
 */
export const useCashStores = (): CashStoreContextValue => {
  const context = useContext(CashStoreContext);
  if (!context) {
    throw new Error('useCashStores must be used within a CashStoreProvider');
  }
  return context;
};

/**
 * Hook de compatibilité pour utiliser le store de session directement
 * (pour faciliter la migration)
 */
export const useCashSessionStoreInjected = () => {
  const { cashSessionStore } = useCashStores();
  return cashSessionStore;
};

/**
 * Hook de compatibilité pour utiliser le store de catégories directement
 */
export const useCategoryStoreInjected = () => {
  const { categoryStore } = useCashStores();
  return categoryStore;
};

/**
 * Hook de compatibilité pour utiliser le store de presets directement
 */
export const usePresetStoreInjected = () => {
  const { presetStore } = useCashStores();
  return presetStore;
};

