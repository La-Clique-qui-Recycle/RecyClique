import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FinalizationScreen from './FinalizationScreen';
import { useFeatureFlag } from '../../utils/features';

// Mock du feature flag
vi.mock('../../utils/features', () => ({
  useFeatureFlag: vi.fn(),
}));

const mockUseFeatureFlag = vi.mocked(useFeatureFlag);

describe('FinalizationScreen', () => {
  beforeEach(() => {
    // Par défaut, le feature flag est désactivé
    mockUseFeatureFlag.mockReturnValue(false);
  });
  it('renders with total and donation default', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={20}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(screen.getByTestId('finalization-screen')).toBeInTheDocument();
    expect(screen.getByTestId('amount-due')).toHaveTextContent('20.00 €');
  });

  it('updates amount due when donation changes', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    const donation = screen.getByTestId('donation-input') as HTMLInputElement;
    fireEvent.change(donation, { target: { value: '2.5' } });
    expect(screen.getByTestId('amount-due')).toHaveTextContent('12.50 €');
  });

  it('shows cash fields for cash method and computes change', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    fireEvent.change(screen.getByTestId('donation-input'), { target: { value: '1.00' } });
    const cashInput = screen.getByTestId('cash-given-input') as HTMLInputElement;
    fireEvent.change(cashInput, { target: { value: '20' } });
    expect(screen.getByTestId('change-output')).toHaveValue('9.00');
    const confirm = screen.getByTestId('confirm-finalization') as HTMLButtonElement;
    expect(confirm.disabled).toBe(false);
  });

  it('disables confirm when cash given is insufficient', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    fireEvent.change(screen.getByTestId('cash-given-input'), { target: { value: '5' } });
    const confirm = screen.getByTestId('confirm-finalization') as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
  });

  it('enables confirm for card without cash given', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    fireEvent.change(screen.getByTestId('payment-select'), { target: { value: 'card' } });
    const confirm = screen.getByTestId('confirm-finalization') as HTMLButtonElement;
    expect(confirm.disabled).toBe(false);
  });

  it('does not show cash fields for check payment (legacy behavior)', () => {
    // Feature flag désactivé - comportement legacy
    mockUseFeatureFlag.mockReturnValue(false);

    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    // Changer vers chèque - aucun champ cash ne devrait être visible
    fireEvent.change(screen.getByTestId('payment-select'), { target: { value: 'check' } });

    expect(screen.queryByTestId('cash-given-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('change-output')).not.toBeInTheDocument();
  });

  it('shows cash fields for check payment with cashChequesV2 enabled', () => {
    // Feature flag activé - nouveau comportement
    mockUseFeatureFlag.mockReturnValue(true);

    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    // Changer vers chèque - devrait montrer le champ "Montant donné" mais pas "Monnaie à rendre"
    fireEvent.change(screen.getByTestId('payment-select'), { target: { value: 'check' } });

    expect(screen.getByTestId('cash-given-input')).toBeInTheDocument();
    expect(screen.queryByTestId('change-output')).not.toBeInTheDocument();
  });

  it('shows both cash fields for cash payment', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    // Par défaut c'est cash, donc les deux champs devraient être visibles
    expect(screen.getByTestId('cash-given-input')).toBeInTheDocument();
    expect(screen.getByTestId('change-output')).toBeInTheDocument();
  });

  it('does not show cash fields for card payment', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    // Changer vers carte - champs cash disparaissent
    fireEvent.change(screen.getByTestId('payment-select'), { target: { value: 'card' } });
    expect(screen.queryByTestId('cash-given-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('change-output')).not.toBeInTheDocument();
  });

  it('requires cash given for check payment with cashChequesV2 enabled', () => {
    // Feature flag activé - nouveau comportement
    mockUseFeatureFlag.mockReturnValue(true);

    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    // Changer vers chèque
    fireEvent.change(screen.getByTestId('payment-select'), { target: { value: 'check' } });

    // Sans montant donné, ne peut pas confirmer
    const confirm = screen.getByTestId('confirm-finalization') as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);

    // Ajouter un montant suffisant
    fireEvent.change(screen.getByTestId('cash-given-input'), { target: { value: '15' } });
    expect(confirm.disabled).toBe(false);
  });

  it('computes change only for cash payment', () => {
    render(
      <FinalizationScreen
        open
        totalAmount={10}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    // Avec cash - change devrait être calculé
    fireEvent.change(screen.getByTestId('donation-input'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('cash-given-input'), { target: { value: '20' } });
    expect(screen.getByTestId('change-output')).toHaveValue('9.00');

    // Changer vers chèque avec flag activé - change ne devrait plus être affiché
    mockUseFeatureFlag.mockReturnValue(true);
    fireEvent.change(screen.getByTestId('payment-select'), { target: { value: 'check' } });
    expect(screen.queryByTestId('change-output')).not.toBeInTheDocument();
  });

  // Story B40-P1-CORRECTION: Tests pour le champ de note déplacé vers le popup
  describe('Note field functionality', () => {
    it('shows note field when callbacks are provided', () => {
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
          saleNote="Test note"
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      const noteInput = screen.getByTestId('sale-note-input');
      expect(noteInput).toBeInTheDocument();
      expect(noteInput).toHaveValue('Test note');
    });

    it('does not show note field when callbacks are not provided', () => {
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
        />
      );

      expect(screen.queryByTestId('sale-note-input')).not.toBeInTheDocument();
    });

    it('calls onSaleNoteChange when note is modified', () => {
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
          saleNote=""
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      const noteInput = screen.getByTestId('sale-note-input');
      fireEvent.change(noteInput, { target: { value: 'New note with spaces' } });

      expect(mockOnSaleNoteChange).toHaveBeenCalledWith('New note with spaces');
    });

    it('preserves spaces in note input (no trimming)', () => {
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
          saleNote=""
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      const noteInput = screen.getByTestId('sale-note-input');
      fireEvent.change(noteInput, { target: { value: '  Note with leading and trailing spaces  ' } });

      expect(mockOnSaleNoteChange).toHaveBeenCalledWith('  Note with leading and trailing spaces  ');
    });

    it('handles empty note input correctly', () => {
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
          saleNote="Existing note"
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      const noteInput = screen.getByTestId('sale-note-input');
      fireEvent.change(noteInput, { target: { value: '' } });

      expect(mockOnSaleNoteChange).toHaveBeenCalledWith(null);
    });
  });

  // Story B40-P1-CORRECTION: Tests d'accessibilité et UX
  describe('Accessibility and UX improvements', () => {
    it('has proper labels and icons for form fields', () => {
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
          saleNote=""
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      // Vérifier que les labels contiennent les icônes et le texte approprié
      expect(screen.getByText('Don (€)')).toBeInTheDocument();
      expect(screen.getByText('Moyen de paiement')).toBeInTheDocument();
      expect(screen.getByText('Note contextuelle (optionnel)')).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
        />
      );

      const modal = screen.getByTestId('finalization-screen');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-label', 'Finaliser la vente');
    });

    it('has proper form field associations', () => {
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={() => {}}
          saleNote=""
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      const donationInput = screen.getByTestId('donation-input');
      const paymentSelect = screen.getByTestId('payment-select');
      const noteTextarea = screen.getByTestId('sale-note-input');

      expect(donationInput).toHaveAttribute('id', 'donation');
      expect(screen.getByLabelText('Don (€)')).toBe(donationInput);

      expect(paymentSelect).toHaveAttribute('id', 'payment');
      expect(screen.getByLabelText('Moyen de paiement')).toBe(paymentSelect);

      expect(noteTextarea).toHaveAttribute('id', 'sale-note');
      expect(screen.getByLabelText('Note contextuelle (optionnel)')).toBe(noteTextarea);
    });

    it('includes note in finalization data', () => {
      const mockOnConfirm = vi.fn();
      const mockOnSaleNoteChange = vi.fn();
      render(
        <FinalizationScreen
          open
          totalAmount={10}
          onCancel={() => {}}
          onConfirm={mockOnConfirm}
          saleNote="Test contextual note"
          onSaleNoteChange={mockOnSaleNoteChange}
        />
      );

      const confirmButton = screen.getByTestId('confirm-finalization');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          note: 'Test contextual note'
        })
      );
    });
  });
});


