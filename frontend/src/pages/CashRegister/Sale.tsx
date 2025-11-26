// Force rebuild: 2025-10-09 01:53
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCashSessionStore } from '../../stores/cashSessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { usePresetStore } from '../../stores/presetStore';
import SaleWizard from '../../components/business/SaleWizard';
import Ticket from '../../components/business/Ticket';
import FinalizationScreen, { FinalizationData } from '../../components/business/FinalizationScreen';
import CashSessionHeader from '../../components/business/CashSessionHeader';
import { Numpad } from '../../components/ui/Numpad';
import type { SaleItemData } from '../../components/business/SaleWizard';

// ===== KIOSK MODE LAYOUT =====

const KioskContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr auto; /* Ligne contenu + ligne footer */
  flex: 1;
  overflow: hidden;
  max-height: calc(100vh - 50px);
  gap: 0;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 2fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto; /* Pas de footer fixe sur mobile */
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

const LeftColumn = styled.div`
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  /* Hide numpad column when in category/subcategory mode */
  &:has(+ [data-wizard-step="idle"]) {
    display: none;
  }

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    min-height: 200px;
    padding: 0.75rem;
  }
`;

const CenterColumn = styled.div`
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 1.5rem;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr auto; /* Contenu + Footer */
  gap: 1rem;

  /* Span 2 columns when in category/subcategory mode (numpad hidden) */
  &[data-wizard-step="idle"] {
    grid-column: span 2;
  }

  @media (max-width: 1200px) {
    border-right: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    overflow: visible;
    grid-column: span 1;
    grid-template-rows: auto; /* Pas de footer fixe sur mobile */
  }
`;

const RightColumn = styled.div`
  background: white;
  padding: 1rem;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr auto; /* Contenu + Footer */

  @media (max-width: 1200px) {
    display: none;
  }

  @media (max-width: 768px) {
    display: grid;
    border-top: 1px solid #e0e0e0;
    grid-template-rows: auto; /* Pas de footer fixe sur mobile */
  }
`;

const Sale: React.FC = () => {
  const navigate = useNavigate();
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [finalizationData, setFinalizationData] = useState<FinalizationData | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  // Numpad state - separated by step type
  const [quantityValue, setQuantityValue] = useState<string>('1');
  const [quantityError, setQuantityError] = useState<string>('');
  const [priceValue, setPriceValue] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightError, setWeightError] = useState<string>('');
  const [numpadMode, setNumpadMode] = useState<'quantity' | 'price' | 'weight' | 'idle'>('idle');

  const {
    currentSession,
    currentSaleItems,
    addSaleItem,
    removeSaleItem,
    updateSaleItem,
    submitSale,
    loading
  } = useCashSessionStore();

  const { currentUser } = useAuthStore();
  const { getCategoryById, fetchCategories } = useCategoryStore();
  const { clearSelection, selectedPreset, notes } = usePresetStore();

  // Numpad handlers - défini AVANT les useEffect qui l'utilisent
  const getCurrentValue = () => {
    switch (numpadMode) {
      case 'quantity': return quantityValue;
      case 'price': return priceValue;
      case 'weight': return weightValue;
      default: return '';
    }
  };

  const getCurrentError = () => {
    switch (numpadMode) {
      case 'quantity': return quantityError;
      case 'price': return priceError;
      case 'weight': return weightError;
      default: return '';
    }
  };

  const setCurrentValue = (value: string) => {
    switch (numpadMode) {
      case 'quantity': setQuantityValue(value); break;
      case 'price': setPriceValue(value); break;
      case 'weight': setWeightValue(value); break;
    }
  };

  const setCurrentError = (error: string) => {
    switch (numpadMode) {
      case 'quantity': setQuantityError(error); break;
      case 'price': setPriceError(error); break;
      case 'weight': setWeightError(error); break;
    }
  };

  const numpadCallbacks = {
    quantityValue,
    quantityError,
    priceValue,
    priceError,
    weightValue,
    weightError,
    setQuantityValue,
    setQuantityError,
    setPriceValue,
    setPriceError,
    setWeightValue,
    setWeightError,
    setMode: setNumpadMode
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!currentSession) {
      navigate('/cash-register');
    }
  }, [currentSession, navigate]);

  // Auto-focus sur le champ prix à l'entrée de l'écran d'encaissement (B39-P4)
  useEffect(() => {
    if (currentSession && numpadMode === 'idle') {
      // Délai pour s'assurer que le DOM est rendu
      const timer = setTimeout(() => {
        const priceInput = document.querySelector('[data-testid="price-input"]');
        if (priceInput instanceof HTMLElement) {
          priceInput.focus();
          // Basculer automatiquement vers le mode prix
          numpadCallbacks.setMode('price');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentSession, numpadMode, numpadCallbacks]);

  const handleItemComplete = (itemData: SaleItemData) => {
    // Get category names from the category store
    const category = getCategoryById(itemData.category);
    const subcategory = itemData.subcategory ? getCategoryById(itemData.subcategory) : null;


    addSaleItem({
      category: itemData.category,
      subcategory: itemData.subcategory,
      categoryName: category?.name,
      subcategoryName: subcategory?.name,
      quantity: itemData.quantity,
      weight: itemData.weight,
      price: itemData.price,
      total: itemData.total,
      presetId: itemData.preset_id,  // Utiliser le preset_id de l'item (déjà isolé par transaction)
      notes: itemData.notes  // Utiliser les notes de l'item (déjà isolées par transaction)
    });

    // Plus besoin de clearSelection() - l'état est maintenant géré par transaction dans SaleWizard
  };

  const handleFinalizeSale = async () => {
    if (currentSaleItems.length === 0) return;
    setIsFinalizing(true);
  };

  const handleCloseSession = () => {
    navigate('/cash-register/session/close');
  };

  if (!currentSession) {
    return null;
  }

  const ticketTotal = useMemo(() => currentSaleItems.reduce((sum, it) => sum + (it.total || 0), 0), [currentSaleItems]);
  
  // Nom du caissier pour le header
  const cashierName = currentUser 
    ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username || 'Caissier'
    : 'Caissier';

  const handleCancelFinalization = () => {
    setIsFinalizing(false);
    setFinalizationData(null);
  };

  const handleConfirmFinalization = async (data: FinalizationData) => {
    setFinalizationData(data);
    setIsFinalizing(false);

    const success = await submitSale(currentSaleItems, data);
    if (success) {
      // Effacer la sélection de preset après une vente réussie
      clearSelection();

      // Afficher une popup de succès qui disparaît automatiquement après 3 secondes
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } else {
      const storeError = useCashSessionStore.getState().error;
      alert(`❌ Erreur lors de l'enregistrement de la vente: ${storeError || 'Erreur inconnue'}`);
    }
  };

  // Numpad handlers
  const handleNumpadDigit = (digit: string) => {
    const currentValue = getCurrentValue();

    if (numpadMode === 'quantity') {
      // Mode "remplacer" : si valeur = "1" et appui sur 2-9, remplacer au lieu d'ajouter
      // Si appui sur "1", ajouter normalement pour permettre 11, 12, etc.
      let newValue: string;
      if (currentValue === '1' && /^[2-9]$/.test(digit)) {
        newValue = digit; // Remplacer le 1 par le nouveau chiffre (2-9)
      } else {
        newValue = currentValue + digit; // Ajouter normalement (y compris pour "1")
      }

      if (/^\d*$/.test(newValue) && parseInt(newValue || '0', 10) <= 9999) {
        // Pour la quantité, empêcher les valeurs < 1
        const numValue = parseInt(newValue || '0', 10);
        if (numValue >= 1) {
          setQuantityValue(newValue);
          setQuantityError('');
        }
      }
    } else if (numpadMode === 'price') {
      const newValue = currentValue + digit;
      if (/^\d*\.?\d{0,2}$/.test(newValue) && parseFloat(newValue || '0') <= 9999.99) {
        setPriceValue(newValue);
        setPriceError('');
      }
    } else if (numpadMode === 'weight') {
      const newValue = currentValue + digit;
      if (/^\d*\.?\d{0,2}$/.test(newValue) && parseFloat(newValue || '0') <= 9999.99) {
        setWeightValue(newValue);
        setWeightError('');
      }
    }
  };

  const handleNumpadClear = () => {
    setCurrentValue('');
    setCurrentError('');
  };

  const handleNumpadBackspace = () => {
    setCurrentValue(getCurrentValue().slice(0, -1));
  };

  const handleNumpadDecimal = () => {
    const currentValue = getCurrentValue();
    if ((numpadMode === 'price' || numpadMode === 'weight') && !currentValue.includes('.')) {
      setCurrentValue(currentValue + '.');
    }
  };

  // Mapping AZERTY vers chiffres (comme en Réception)
  const AZERTY_NUMERIC_MAP: Record<string, string> = {
    '&': '1',
    'é': '2',
    '"': '3',
    "'": '4',
    '(': '5',
    '-': '6',
    'è': '7',
    '_': '8',
    'ç': '9',
    'à': '0'
  };

  // Gestionnaires de raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input ou textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Raccourcis pour les chiffres directs (0-9)
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        handleNumpadDigit(event.key);
        return;
      }

      // Raccourcis AZERTY pour les chiffres (comme en Réception)
      if (AZERTY_NUMERIC_MAP[event.key]) {
        event.preventDefault();
        handleNumpadDigit(AZERTY_NUMERIC_MAP[event.key]);
        return;
      }

      // Raccourci pour le point décimal
      if (event.key === '.' || event.key === ',') {
        event.preventDefault();
        handleNumpadDecimal();
        return;
      }
      
      // Raccourci pour effacer (Backspace)
      if (event.key === 'Backspace') {
        event.preventDefault();
        handleNumpadBackspace();
        return;
      }
      
      // Raccourci pour tout effacer (Escape)
      if (event.key === 'Escape') {
        event.preventDefault();
        handleNumpadClear();
        return;
      }

      // Raccourci pour "+" (touche "=" en AZERTY) en mode weight pour ajouter une pesée
      // Laisser MultipleWeightEntry gérer le "+" directement, mais mapper "=" vers "+"
      if (numpadMode === 'weight' && event.key === '=') {
        event.preventDefault();
        // Simuler un événement "+" pour que MultipleWeightEntry le gère
        const plusEvent = new KeyboardEvent('keydown', {
          key: '+',
          code: 'Equal',
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(plusEvent);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [numpadMode, quantityValue, priceValue, weightValue]);

  return (
    <KioskContainer>
      {/* Header de session en haut */}
      <CashSessionHeader
        cashierName={cashierName}
        sessionId={currentSession.id}
        onCloseSession={handleCloseSession}
        isLoading={loading}
      />

      {/* Layout principal à 3 colonnes: Numpad | Action Zone | Ticket */}
      <MainLayout>
        {/* Colonne de gauche - Numpad unifié (présent à partir de Poids) */}
        <LeftColumn>
          {numpadMode !== 'idle' ? (
            <Numpad
              value={getCurrentValue()}
              error={getCurrentError()}
              onDigit={handleNumpadDigit}
              onClear={handleNumpadClear}
              onBackspace={handleNumpadBackspace}
              onDecimal={(numpadMode === 'price' || numpadMode === 'weight') ? handleNumpadDecimal : undefined}
              unit={numpadMode === 'price' ? '€' : numpadMode === 'weight' ? 'kg' : ''}
              showDecimal={numpadMode === 'price' || numpadMode === 'weight'}
              placeholder="0"
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '2rem'
            }}>
              Sélectionnez une étape nécessitant une saisie numérique
            </div>
          )}
        </LeftColumn>

        {/* Colonne centrale - SaleWizard (s'étend sur colonnes 1+2 pour catégories) */}
        <CenterColumn data-wizard-step={numpadMode}>
          <SaleWizard
            onItemComplete={handleItemComplete}
            numpadCallbacks={numpadCallbacks}
            currentMode={numpadMode}
          />

          {/* Success popup */}
          {showSuccessPopup && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#4caf50',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              zIndex: 3000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              ✅ Vente enregistrée avec succès !
            </div>
          )}
        </CenterColumn>

        {/* Colonne de droite - Ticket */}
        <RightColumn>
          <Ticket
            items={currentSaleItems.map(it => ({ ...it, total: it.total }))}
            onRemoveItem={removeSaleItem}
            onUpdateItem={updateSaleItem}
            onFinalizeSale={handleFinalizeSale}
            loading={loading}
          />
        </RightColumn>
      </MainLayout>

      {/* Finalization modal (overlay) */}
      <FinalizationScreen
        open={isFinalizing}
        totalAmount={ticketTotal}
        onCancel={handleCancelFinalization}
        onConfirm={handleConfirmFinalization}
      />
    </KioskContainer>
  );
};

export default Sale;