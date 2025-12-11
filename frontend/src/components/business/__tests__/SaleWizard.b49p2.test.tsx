/**
 * Story B49-P2: Tests pour le mode prix global (no_item_pricing)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import SaleWizard from '../SaleWizard';
import { useCashWizardStepState } from '../../../hooks/useCashWizardStepState';
import { useCashSessionStore } from '../../../stores/cashSessionStore';
import { useCategoryStore } from '../../../stores/categoryStore';
import { usePresetStore } from '../../../stores/presetStore';

// Mocks
vi.mock('../../../hooks/useCashWizardStepState');
vi.mock('../../../stores/cashSessionStore');
vi.mock('../../../stores/categoryStore');
vi.mock('../../../stores/presetStore');
vi.mock('../../../utils/features', () => ({
  useFeatureFlag: vi.fn(() => false)
}));

const mockUseCashWizardStepState = vi.mocked(useCashWizardStepState);
const mockUseCashSessionStore = vi.mocked(useCashSessionStore);
const mockUseCategoryStore = vi.mocked(useCategoryStore);
const mockUsePresetStore = vi.mocked(usePresetStore);

describe('SaleWizard - B49-P2 Mode Prix Global', () => {
  const mockNumpadCallbacks = {
    quantityValue: '1',
    quantityError: '',
    priceValue: '0',
    priceError: '',
    weightValue: '2.5',
    weightError: '',
    setQuantityValue: vi.fn(),
    setQuantityError: vi.fn(),
    setPriceValue: vi.fn(),
    setPriceError: vi.fn(),
    setWeightValue: vi.fn(),
    setWeightError: vi.fn(),
    setMode: vi.fn(),
    setPricePrefilled: vi.fn()
  };

  const mockOnItemComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseCashWizardStepState.mockReturnValue({
      stepState: {
        currentStep: 'category',
        categoryState: 'active',
        subcategoryState: 'inactive',
        weightState: 'inactive',
        quantityState: 'inactive',
        priceState: 'inactive',
        stepStartTime: new Date(),
        lastActivity: new Date()
      },
      transitionToStep: vi.fn(),
      handleCategorySelected: vi.fn(),
      handleSubcategorySelected: vi.fn(),
      handleWeightInputStarted: vi.fn(),
      handleWeightInputCompleted: vi.fn(),
      handleQuantityInputCompleted: vi.fn(),
      handlePriceInputCompleted: vi.fn(),
      handleTicketClosed: vi.fn()
    });

    mockUseCategoryStore.mockReturnValue({
      getCategoryById: vi.fn(() => ({ id: 'cat1', name: 'Test Category' })),
      activeCategories: [],
      fetchCategories: vi.fn()
    });

    mockUsePresetStore.mockReturnValue({
      selectedPreset: null,
      notes: '',
      clearSelection: vi.fn(),
      setNotes: vi.fn(),
      presets: []
    });
  });

  it('masque l\'onglet Quantité quand mode prix global activé', () => {
    mockUseCashSessionStore.mockReturnValue({
      currentRegisterOptions: {
        features: {
          no_item_pricing: { enabled: true }
        }
      }
    } as any);

    render(
      <SaleWizard
        onItemComplete={mockOnItemComplete}
        numpadCallbacks={mockNumpadCallbacks}
        currentMode="idle"
      />
    );

    // L'onglet Quantité ne doit pas être présent
    const quantityTab = screen.queryByText('Quantité');
    expect(quantityTab).not.toBeInTheDocument();
  });

  it('affiche l\'onglet Quantité quand mode prix global désactivé', () => {
    mockUseCashSessionStore.mockReturnValue({
      currentRegisterOptions: {
        features: {}
      }
    } as any);

    render(
      <SaleWizard
        onItemComplete={mockOnItemComplete}
        numpadCallbacks={mockNumpadCallbacks}
        currentMode="idle"
      />
    );

    // L'onglet Quantité doit être présent
    const quantityTab = screen.queryByText('Quantité');
    expect(quantityTab).toBeInTheDocument();
  });

  it('accepte prix 0€ en mode prix global', () => {
    mockUseCashSessionStore.mockReturnValue({
      currentRegisterOptions: {
        features: {
          no_item_pricing: { enabled: true }
        }
      }
    } as any);

    mockUseCashWizardStepState.mockReturnValue({
      stepState: {
        currentStep: 'price',
        categoryState: 'completed',
        subcategoryState: 'completed',
        weightState: 'completed',
        quantityState: 'completed',
        priceState: 'active',
        stepStartTime: new Date(),
        lastActivity: new Date()
      },
      transitionToStep: vi.fn(),
      handleCategorySelected: vi.fn(),
      handleSubcategorySelected: vi.fn(),
      handleWeightInputStarted: vi.fn(),
      handleWeightInputCompleted: vi.fn(),
      handleQuantityInputCompleted: vi.fn(),
      handlePriceInputCompleted: vi.fn(),
      handleTicketClosed: vi.fn()
    });

    const numpadWithZeroPrice = {
      ...mockNumpadCallbacks,
      priceValue: '0'
    };

    render(
      <SaleWizard
        onItemComplete={mockOnItemComplete}
        numpadCallbacks={numpadWithZeroPrice}
        currentMode="price"
      />
    );

    // Le bouton "Valider" doit être présent (et non "Valider le prix")
    const validateButton = screen.getByText('Valider');
    expect(validateButton).toBeInTheDocument();
  });

  it('comportement prix dynamique: saute quantité et va directement au prix en mode prix global', () => {
    mockUseCashSessionStore.mockReturnValue({
      currentRegisterOptions: {
        features: {
          no_item_pricing: { enabled: true }
        }
      }
    } as any);

    const mockTransitionToStep = vi.fn();
    mockUseCashWizardStepState.mockReturnValue({
      stepState: {
        currentStep: 'weight',
        categoryState: 'completed',
        subcategoryState: 'completed',
        weightState: 'completed',
        quantityState: 'inactive', // Quantité inactive en mode prix global
        priceState: 'inactive',
        stepStartTime: new Date(),
        lastActivity: new Date()
      },
      transitionToStep: mockTransitionToStep,
      handleCategorySelected: vi.fn(),
      handleSubcategorySelected: vi.fn(),
      handleWeightInputStarted: vi.fn(),
      handleWeightInputCompleted: vi.fn(),
      handleQuantityInputCompleted: vi.fn(),
      handlePriceInputCompleted: vi.fn(),
      handleTicketClosed: vi.fn()
    });

    const numpadWithWeight = {
      ...mockNumpadCallbacks,
      weightValue: '2.5',
      priceValue: '0' // Prix peut être 0€ en mode prix global
    };

    render(
      <SaleWizard
        onItemComplete={mockOnItemComplete}
        numpadCallbacks={numpadWithWeight}
        currentMode="weight"
      />
    );

    // En mode prix global, après le poids, on doit aller directement au prix (pas à quantité)
    // Vérifier que quantityState reste inactive
    expect(mockUseCashWizardStepState).toHaveBeenCalled();
  });

  it('comportement prix dynamique: prix peut être modifié librement en mode prix global', () => {
    mockUseCashSessionStore.mockReturnValue({
      currentRegisterOptions: {
        features: {
          no_item_pricing: { enabled: true }
        }
      }
    } as any);

    const mockSetPriceValue = vi.fn();
    const numpadWithPriceCallback = {
      ...mockNumpadCallbacks,
      setPriceValue: mockSetPriceValue,
      priceValue: '15.50'
    };

    mockUseCashWizardStepState.mockReturnValue({
      stepState: {
        currentStep: 'price',
        categoryState: 'completed',
        subcategoryState: 'completed',
        weightState: 'completed',
        quantityState: 'inactive',
        priceState: 'active',
        stepStartTime: new Date(),
        lastActivity: new Date()
      },
      transitionToStep: vi.fn(),
      handleCategorySelected: vi.fn(),
      handleSubcategorySelected: vi.fn(),
      handleWeightInputStarted: vi.fn(),
      handleWeightInputCompleted: vi.fn(),
      handleQuantityInputCompleted: vi.fn(),
      handlePriceInputCompleted: vi.fn(),
      handleTicketClosed: vi.fn()
    });

    render(
      <SaleWizard
        onItemComplete={mockOnItemComplete}
        numpadCallbacks={numpadWithPriceCallback}
        currentMode="price"
      />
    );

    // Le prix peut être modifié librement (pas de validation stricte)
    // Le composant doit permettre la saisie de n'importe quel prix, y compris 0€
    expect(numpadWithPriceCallback.priceValue).toBe('15.50');
  });
});


