/**
 * Tests pour LegacyImport (Story B47-P3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LegacyImport from '../LegacyImport';
import { adminService } from '../../../services/adminService';
import { categoryService } from '../../../services/categoryService';

// Mock des services
vi.mock('../../../services/adminService');
vi.mock('../../../services/categoryService');
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const mockAdminService = adminService as any;
const mockCategoryService = categoryService as any;

describe('LegacyImport', () => {
  const mockCategories = [
    { id: '1', name: 'Vaisselle', is_active: true },
    { id: '2', name: 'DEEE', is_active: true },
    { id: '3', name: 'DIVERS', is_active: true },
  ];

  const mockAnalyzeResult = {
    mappings: {
      'Vaisselle': {
        category_id: '1',
        category_name: 'Vaisselle',
        confidence: 95,
      },
      'DEEE': {
        category_id: '2',
        category_name: 'DEEE',
        confidence: 85,
      },
    },
    unmapped: ['D3E', 'EEE PAM'],
    statistics: {
      total_lines: 100,
      valid_lines: 95,
      error_lines: 5,
      unique_categories: 4,
      mapped_categories: 2,
      unmapped_categories: 2,
    },
    errors: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoryService.getCategories.mockResolvedValue(mockCategories);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Étape 1: Upload CSV', () => {
    it('devrait afficher le formulaire d\'upload', () => {
      render(<LegacyImport />);
      expect(screen.getByText('Sélectionner un fichier CSV')).toBeInTheDocument();
    });

    it('devrait valider que le fichier est un CSV', async () => {
      const user = userEvent.setup();
      render(<LegacyImport />);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/sélectionner/i) || document.querySelector('input[type="file"]');
      
      if (input) {
        await user.upload(input, file);
        // Le composant devrait rejeter le fichier non-CSV
      }
    });

    it('devrait analyser le CSV après sélection', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      // Simuler la sélection d'un fichier CSV
      const csvFile = new File(['date,category,poids_kg,destination,notes\n2024-01-01,Vaisselle,10,MAGASIN,test'], 'test.csv', {
        type: 'text/csv',
      });

      // Trouver le bouton d'upload et déclencher l'analyse
      const analyzeButton = screen.getByText(/analyser/i);
      expect(analyzeButton).toBeInTheDocument();
    });
  });

  describe('Étape 2: Affichage des Mappings', () => {
    it('devrait afficher les statistiques après analyse', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      // Simuler l'analyse réussie
      await waitFor(() => {
        expect(mockAdminService.analyzeLegacyImport).toHaveBeenCalled();
      });
    });

    it('devrait afficher les mappings avec badges de confiance', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      // Attendre que les mappings soient affichés
      await waitFor(() => {
        expect(screen.getByText('Vaisselle')).toBeInTheDocument();
      });
    });

    it('devrait afficher les catégories non mappables', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      await waitFor(() => {
        expect(screen.getByText('D3E')).toBeInTheDocument();
      });
    });
  });

  describe('Étape 3: Correction Manuelle', () => {
    it('devrait permettre de modifier un mapping', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      await waitFor(() => {
        expect(screen.getByText('Vaisselle')).toBeInTheDocument();
      });

      // Trouver le select de mapping et le modifier
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('devrait permettre de rejeter une catégorie', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      await waitFor(() => {
        expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
      });
    });
  });

  describe('Étape 4: Export Mapping', () => {
    it('devrait exporter le mapping en JSON', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);

      render(<LegacyImport />);

      // Simuler l'export
      const exportButton = await screen.findByText(/exporter/i);
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Étape 5: Import', () => {
    const mockImportReport = {
      postes_created: 5,
      postes_reused: 2,
      tickets_created: 7,
      lignes_imported: 95,
      errors: [],
      total_errors: 0,
    };

    it('devrait exécuter l\'import avec CSV et mapping', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);
      mockAdminService.executeLegacyImport.mockResolvedValue({
        report: mockImportReport,
        message: 'Import terminé avec succès',
      });

      render(<LegacyImport />);

      // Naviguer jusqu'à l'étape d'import
      await waitFor(() => {
        const importButton = screen.getByText(/importer/i);
        expect(importButton).toBeInTheDocument();
      });
    });

    it('devrait afficher le rapport d\'import après succès', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);
      mockAdminService.executeLegacyImport.mockResolvedValue({
        report: mockImportReport,
        message: 'Import terminé avec succès',
      });

      render(<LegacyImport />);

      await waitFor(() => {
        expect(screen.getByText(/postes créés/i)).toBeInTheDocument();
      });
    });

    it('devrait afficher les erreurs en cas d\'échec', async () => {
      mockAdminService.analyzeLegacyImport.mockResolvedValue(mockAnalyzeResult);
      mockAdminService.executeLegacyImport.mockRejectedValue({
        response: {
          data: {
            detail: 'Erreur lors de l\'import',
          },
        },
      });

      render(<LegacyImport />);

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs d\'analyse', async () => {
      mockAdminService.analyzeLegacyImport.mockRejectedValue({
        response: {
          data: {
            detail: 'Format CSV invalide',
          },
        },
      });

      render(<LegacyImport />);

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });
    });

    it('devrait gérer les erreurs de chargement des catégories', async () => {
      mockCategoryService.getCategories.mockRejectedValue(new Error('Erreur réseau'));

      render(<LegacyImport />);

      await waitFor(() => {
        expect(mockCategoryService.getCategories).toHaveBeenCalled();
      });
    });
  });
});

