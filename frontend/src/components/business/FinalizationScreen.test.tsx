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
});


