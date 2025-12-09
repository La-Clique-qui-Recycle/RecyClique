/**
 * Page d'Import Legacy CSV (Story B47-P3)
 * Interface web pour valider et corriger les mappings de catégories proposés par le système
 * Accessible uniquement aux Administrateurs et Super-Administrateurs
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Stepper,
  Button,
  Group,
  Paper,
  Alert,
  Table,
  Badge,
  Select,
  TextInput,
  Stack,
  LoadingOverlay,
  FileButton,
  Progress,
  Divider,
  Box,
  Checkbox
} from '@mantine/core';
import {
  IconUpload,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconFileTypeCsv,
  IconDownload,
  IconDatabaseImport
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { adminService } from '../../services/adminService';
import { categoryService, Category } from '../../services/categoryService';

// Types pour les données d'import
interface CategoryMapping {
  category_id: string;
  category_name: string;
  confidence: number;
}

interface LegacyImportAnalyzeResponse {
  mappings: Record<string, CategoryMapping>;
  unmapped: string[];
  statistics: {
    total_lines: number;
    valid_lines: number;
    error_lines: number;
    unique_categories: number;
    mapped_categories: number;
    unmapped_categories: number;
    llm_attempted: boolean;
    llm_model_used: string | null;
    llm_batches_total: number;
    llm_batches_succeeded: number;
    llm_batches_failed: number;
    llm_mapped_categories: number;
    llm_unmapped_after_llm: number;
    llm_last_error: string | null;
    llm_avg_confidence: number | null;
    llm_provider_used: string | null;
  };
  errors: string[];
}

interface LLMModel {
  id: string;
  name: string;
  provider: string | null;
  is_free: boolean;
  context_length: number | null;
  pricing: { prompt: string; completion: string } | null;
}

interface ImportReport {
  postes_created: number;
  postes_reused: number;
  tickets_created: number;
  lignes_imported: number;
  errors: string[];
  total_errors: number;
}

interface LegacyImportExecuteResponse {
  report: ImportReport;
  message: string;
}

const LegacyImport: React.FC = () => {
  // État du stepper
  const [activeStep, setActiveStep] = useState(0);

  // Étape 1: Upload CSV
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<LegacyImportAnalyzeResponse | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  
  // Sélecteur de modèles LLM (T5)
  const [llmModels, setLlmModels] = useState<LLMModel[]>([]);
  const [loadingLlmModels, setLoadingLlmModels] = useState(false);
  const [selectedLlmModelId, setSelectedLlmModelId] = useState<string | null>(null);
  const [llmModelsError, setLlmModelsError] = useState<string | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  
  // Relance LLM ciblée (T7)
  const [relaunchingLlm, setRelaunchingLlm] = useState(false);

  // Étape 2-3: Mappings
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [mappings, setMappings] = useState<Record<string, CategoryMapping>>({});
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [rejectedCategories, setRejectedCategories] = useState<Set<string>>(new Set());

  // Étape 4: Export
  const [exporting, setExporting] = useState(false);

  // Étape 5: Import
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Tri du tableau des mappings
  const [sortBy, setSortBy] = useState<'csv' | 'proposed' | 'confidence'>('csv');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination locale sur les mappings (pour alléger le rendu)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Recherche contrôlée dans les Select (pour éviter la réinitialisation au moindre re-render)
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});

  // Charger les catégories au montage
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const cats = await categoryService.getCategories(true); // Seulement actives
        setCategories(cats);
      } catch (error: any) {
        console.error('Erreur lors du chargement des catégories:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger les catégories',
          color: 'red',
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Charger les modèles LLM au montage (T5)
  useEffect(() => {
    const loadLlmModels = async () => {
      setLoadingLlmModels(true);
      setLlmModelsError(null);
      try {
        const result = await adminService.getLegacyImportLLMModels();
        if (result.error) {
          setLlmModelsError(result.error);
          setLlmModels([]);
        } else {
          setLlmModels(result.models);
          setLlmModelsError(null); // Réinitialiser l'erreur si les modèles sont chargés avec succès
          // Valeur par défaut: modèle depuis ENV, sinon premier modèle gratuit, sinon premier modèle disponible
          if (result.models.length > 0 && !selectedLlmModelId) {
            const defaultModel = result.default_model_id
              ? result.models.find(m => m.id === result.default_model_id)
              : null;
            if (defaultModel) {
              setSelectedLlmModelId(defaultModel.id);
            } else {
              const freeModel = result.models.find(m => m.is_free);
              setSelectedLlmModelId(freeModel ? freeModel.id : result.models[0].id);
            }
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des modèles LLM:', error);
        setLlmModelsError('Impossible de charger les modèles LLM');
        setLlmModels([]);
      } finally {
        setLoadingLlmModels(false);
      }
    };
    loadLlmModels();
  }, []);

  // Étape 1: Analyser le CSV
  const handleAnalyze = async () => {
    if (!csvFile) {
      notifications.show({
        title: 'Erreur',
        message: 'Veuillez sélectionner un fichier CSV',
        color: 'red',
      });
      return;
    }

    // Alert de confirmation si des corrections manuelles existent (T8)
    if (Object.keys(mappings).length > 0 && analyzeResult) {
      const hasManualChanges = Object.keys(mappings).some(
        key => !analyzeResult.mappings[key] || mappings[key].confidence === 100
      );
      if (hasManualChanges) {
        const confirmed = window.confirm(
          'Attention : relancer l\'analyse effacera vos corrections manuelles. ' +
          'Utilisez "Relancer LLM" pour préserver vos modifications. Continuer ?'
        );
        if (!confirmed) {
          return;
        }
      }
    }

    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await adminService.analyzeLegacyImport(
        csvFile,
        undefined,
        selectedLlmModelId || undefined
      );
      setAnalyzeResult(result);
      setMappings(result.mappings);
      setUnmapped(result.unmapped);
      setRejectedCategories(new Set());
      setActiveStep(1); // Passer à l'étape 2
      notifications.show({
        title: 'Analyse terminée',
        message: `${result.statistics.mapped_categories} catégories mappées, ${result.statistics.unmapped_categories} non mappées`,
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors de l\'analyse';
      setAnalyzeError(errorMessage);
      notifications.show({
        title: 'Erreur',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Relancer LLM uniquement sur les catégories restantes (T7)
  const handleRelaunchLLM = async () => {
    if (!analyzeResult || unmapped.length === 0 || !selectedLlmModelId) {
      return;
    }

    setRelaunchingLlm(true);
    try {
      const result = await adminService.analyzeLegacyImportLLMOnly(
        unmapped,
        selectedLlmModelId
      );

      // Fusionner les nouveaux mappings (sans écraser les corrections manuelles) (T7)
      const newMappings = { ...mappings };
      Object.keys(result.mappings).forEach(key => {
        // Ne pas écraser si c'est une correction manuelle (confidence = 100)
        if (!newMappings[key] || newMappings[key].confidence !== 100) {
          newMappings[key] = result.mappings[key];
        }
      });

      setMappings(newMappings);
      
      // Mettre à jour unmapped avec les nouvelles catégories restantes
      const newlyMapped = Object.keys(result.mappings);
      setUnmapped(prev => prev.filter(cat => !newlyMapped.includes(cat)));

      // Mettre à jour analyzeResult avec les nouvelles stats
      if (analyzeResult) {
        setAnalyzeResult({
          ...analyzeResult,
          mappings: newMappings,
          unmapped: unmapped.filter(cat => !newlyMapped.includes(cat)),
          statistics: {
            ...analyzeResult.statistics,
            llm_mapped_categories: analyzeResult.statistics.llm_mapped_categories + result.statistics.llm_mapped_categories,
            llm_batches_total: analyzeResult.statistics.llm_batches_total + result.statistics.llm_batches_total,
            llm_batches_succeeded: analyzeResult.statistics.llm_batches_succeeded + result.statistics.llm_batches_succeeded,
            llm_batches_failed: analyzeResult.statistics.llm_batches_failed + result.statistics.llm_batches_failed,
            llm_unmapped_after_llm: unmapped.length - newlyMapped.length,
            llm_last_error: result.statistics.llm_last_error || analyzeResult.statistics.llm_last_error,
            llm_avg_confidence: result.statistics.llm_avg_confidence || analyzeResult.statistics.llm_avg_confidence,
          },
        });
      }

      notifications.show({
        title: 'Relance LLM terminée',
        message: `${result.statistics.llm_mapped_categories} nouvelles catégories mappées par le LLM`,
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors de la relance LLM';
      notifications.show({
        title: 'Erreur',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setRelaunchingLlm(false);
    }
  };

  // Étape 3: Modifier un mapping
  const handleMappingChange = (csvCategory: string, categoryId: string | null) => {
    if (categoryId === null) {
      // Rejeter la catégorie
      setRejectedCategories(prev => new Set([...prev, csvCategory]));
      const newMappings = { ...mappings };
      delete newMappings[csvCategory];
      setMappings(newMappings);
    } else {
      // Mapper vers une catégorie
      setRejectedCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(csvCategory);
        return newSet;
      });
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        setMappings(prev => ({
          ...prev,
          [csvCategory]: {
            category_id: categoryId,
            category_name: category.name,
            confidence: 100 // Mapping manuel = 100%
          }
        }));
      }
    }
  };

  // Réinitialiser les mappings
  const handleResetMappings = () => {
    if (analyzeResult) {
      setMappings(analyzeResult.mappings);
      setUnmapped(analyzeResult.unmapped);
      setRejectedCategories(new Set());
    }
  };

  // Étape 4: Exporter le mapping
  const handleExportMapping = () => {
    setExporting(true);
    try {
      const mappingData = {
        mappings: mappings,
        unmapped: unmapped.filter(cat => !rejectedCategories.has(cat))
      };

      const jsonStr = JSON.stringify(mappingData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'category_mapping.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: 'Export réussi',
        message: 'Le fichier de mapping a été téléchargé',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible d\'exporter le mapping',
        color: 'red',
      });
    } finally {
      setExporting(false);
    }
  };

  // Étape 5: Importer
  const handleImport = async () => {
    if (!csvFile) {
      notifications.show({
        title: 'Erreur',
        message: 'Aucun fichier CSV sélectionné',
        color: 'red',
      });
      return;
    }

    // Créer le fichier de mapping
    const mappingData = {
      mappings: mappings,
      unmapped: unmapped.filter(cat => !rejectedCategories.has(cat))
    };

    const mappingBlob = new Blob([JSON.stringify(mappingData)], { type: 'application/json' });
    const mappingFile = new File([mappingBlob], 'category_mapping.json', { type: 'application/json' });

    setImporting(true);
    setImportProgress(0);
    setImportError(null);
    setImportReport(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simuler la progression (l'API ne supporte pas encore le streaming)
      progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await adminService.executeLegacyImport(csvFile, mappingFile);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setImportProgress(100);
      setImportReport(result.report);

      notifications.show({
        title: 'Import réussi',
        message: result.message,
        color: 'green',
      });
    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors de l\'import';
      setImportError(errorMessage);
      notifications.show({
        title: 'Erreur',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setImporting(false);
    }
  };

  // Obtenir la couleur du badge de confiance
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'green';
    if (confidence >= 80) return 'yellow';
    return 'red';
  };

  // Construire une hiérarchie catégories / sous-catégories pour reproduire l'affichage de /admin/categories
  const categoryOptions = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const activeCategories = categories.filter(cat => cat.is_active);

    type TreeNode = Category & { children: TreeNode[] };

    const categoryMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Créer des noeuds avec enfants vides en préservant l'ordre initial (qui reflète déjà display_order)
    activeCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Construire la hiérarchie parent/enfant
    activeCategories.forEach(cat => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const options: { value: string; label: string }[] = [];

    const walk = (nodes: TreeNode[], level: number) => {
      nodes.forEach(node => {
        const indent = '  '.repeat(level);
        const prefix = level > 0 ? '• ' : '';
        options.push({
          value: node.id,
          label: `${indent}${prefix}${node.name}`,
        });
        if (node.children.length > 0) {
          walk(node.children, level + 1);
        }
      });
    };

    walk(roots, 0);
    return options;
  }, [categories]);

  const getCategoryOptions = () => categoryOptions;

  // Entrées triées pour le tableau des mappings
  const sortedMappingsEntries = useMemo(() => {
    const entries = Object.entries(mappings);
    entries.sort(([csvA, mapA], [csvB, mapB]) => {
      let cmp = 0;
      if (sortBy === 'csv') {
        cmp = csvA.localeCompare(csvB, 'fr', { sensitivity: 'base' });
      } else if (sortBy === 'proposed') {
        cmp = mapA.category_name.localeCompare(mapB.category_name, 'fr', { sensitivity: 'base' });
      } else if (sortBy === 'confidence') {
        cmp = mapA.confidence - mapB.confidence;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return entries;
  }, [mappings, sortBy, sortDirection]);

  // Remettre la pagination à 1 quand le jeu de données change
  useEffect(() => {
    setCurrentPage(1);
  }, [Object.keys(mappings).length, analyzeResult?.statistics.unique_categories]);

  const totalPages = Math.max(1, Math.ceil(sortedMappingsEntries.length / pageSize));
  const paginatedMappingsEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedMappingsEntries.slice(start, end);
  }, [sortedMappingsEntries, currentPage, pageSize]);

  const toggleSort = (key: 'csv' | 'proposed' | 'confidence') => {
    setSortBy(prevKey => {
      if (prevKey === key) {
        setSortDirection(prevDir => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSortDirection('asc');
      return key;
    });
  };

  const renderSortIndicator = (key: 'csv' | 'proposed' | 'confidence') => {
    if (sortBy !== key) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Import Legacy CSV</Title>
      <Text c="dimmed" mb="xl">
        Importez vos données historiques depuis un CSV nettoyé. Validez et corrigez les mappings de catégories proposés par le système.
      </Text>

      <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm" mb="xl">
        <Stepper.Step label="Upload CSV" description="Sélectionner et analyser le fichier">
          <Paper p="md" withBorder>
            <Stack>
              <Text size="sm" c="dimmed" mb="md">
                Sélectionnez le fichier CSV nettoyé contenant les colonnes: date, category, poids_kg, destination, notes
              </Text>
              
              <Group>
                <FileButton
                  onChange={(file) => {
                    if (file) {
                      if (!file.name.toLowerCase().endsWith('.csv')) {
                        notifications.show({
                          title: 'Erreur',
                          message: 'Le fichier doit être un CSV',
                          color: 'red',
                        });
                        return;
                      }
                      setCsvFile(file);
                      setAnalyzeResult(null);
                      setAnalyzeError(null);
                    }
                  }}
                  accept=".csv"
                >
                  {(props) => (
                    <Button leftSection={<IconUpload size={16} />} {...props}>
                      Sélectionner un fichier CSV
                    </Button>
                  )}
                </FileButton>
                
                <Button
                  variant="outline"
                  leftSection={<IconDownload size={16} />}
                  onClick={async () => {
                    try {
                      await adminService.downloadReceptionOfflineTemplate();
                      notifications.show({
                        title: 'Téléchargement réussi',
                        message: 'Le template CSV offline a été téléchargé',
                        color: 'green',
                      });
                    } catch (error: any) {
                      notifications.show({
                        title: 'Erreur',
                        message: error.response?.data?.detail || error.message || 'Impossible de télécharger le template',
                        color: 'red',
                      });
                    }
                  }}
                >
                  Télécharger le template
                </Button>
                
                {csvFile && (
                  <Group>
                    <IconFileTypeCsv size={20} />
                    <Text size="sm">{csvFile.name}</Text>
                    <Text size="xs" c="dimmed">
                      ({(csvFile.size / 1024).toFixed(2)} KB)
                    </Text>
                  </Group>
                )}
              </Group>

              {/* Sélecteur de modèles LLM (T5) */}
              <Stack gap="sm" mt="md">
                <Group justify="space-between" align="flex-start">
                  <Text size="sm" fw={500}>Modèle LLM (optionnel)</Text>
                  {llmModelsError && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={async () => {
                        setLoadingLlmModels(true);
                        setLlmModelsError(null);
                        try {
                          const result = await adminService.getLegacyImportLLMModels();
                          if (result.error) {
                            setLlmModelsError(result.error);
                            setLlmModels([]);
                          } else {
                            setLlmModels(result.models);
                            setLlmModelsError(null); // Réinitialiser l'erreur si les modèles sont chargés avec succès
                            if (result.models.length > 0 && !selectedLlmModelId) {
                              const defaultModel = result.default_model_id
                                ? result.models.find(m => m.id === result.default_model_id)
                                : null;
                              if (defaultModel) {
                                setSelectedLlmModelId(defaultModel.id);
                              } else {
                                const freeModel = result.models.find(m => m.is_free);
                                setSelectedLlmModelId(freeModel ? freeModel.id : result.models[0].id);
                              }
                            }
                          }
                        } catch (error: any) {
                          console.error('Erreur lors du chargement des modèles LLM:', error);
                          setLlmModelsError('Impossible de charger les modèles LLM');
                          setLlmModels([]);
                        } finally {
                          setLoadingLlmModels(false);
                        }
                      }}
                      disabled={loadingLlmModels}
                    >
                      Recharger
                    </Button>
                  )}
                </Group>
                <Checkbox
                  label="Afficher uniquement les modèles gratuits"
                  checked={showFreeOnly}
                  onChange={(event) => setShowFreeOnly(event.currentTarget.checked)}
                  disabled={loadingLlmModels}
                />
                <Select
                  data={[
                    { value: '__none__', label: 'Aucun (désactiver le LLM)' },
                    ...(showFreeOnly
                      ? llmModels.filter(m => m.is_free)
                      : llmModels
                    ).map(m => ({
                      value: m.id,
                      label: `${m.name}${m.is_free ? ' (Gratuit)' : ''}`,
                    })),
                  ]}
                  value={selectedLlmModelId || '__none__'}
                  onChange={(value) => {
                    setSelectedLlmModelId(value === '__none__' ? null : value);
                  }}
                  disabled={loadingLlmModels || analyzing}
                  loading={loadingLlmModels}
                  placeholder={loadingLlmModels ? "Chargement des modèles..." : "Sélectionner un modèle ou désactiver le LLM"}
                  searchable
                  nothingFoundMessage="Aucun modèle trouvé"
                />
                {llmModelsError && (
                  <Alert color="orange" title="Erreur de chargement" size="xs">
                    {llmModelsError}
                    {llmModels.length === 0 && (
                      <Text size="xs" mt="xs">
                        Le LLM sera désactivé. Vous pouvez utiliser uniquement le fuzzy matching.
                      </Text>
                    )}
                  </Alert>
                )}
                {!loadingLlmModels && !llmModelsError && llmModels.length === 0 && (
                  <Alert color="yellow" title="Aucun modèle disponible" size="xs">
                    Aucun modèle LLM n'a pu être chargé. Le LLM sera désactivé et seul le fuzzy matching sera utilisé.
                  </Alert>
                )}
              </Stack>

              {analyzeError && (
                <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red" mt="md">
                  {analyzeError}
                </Alert>
              )}

              <Group mt="md">
                <Button
                  onClick={handleAnalyze}
                  disabled={!csvFile || analyzing}
                  loading={analyzing}
                  leftSection={<IconCheck size={16} />}
                >
                  Analyser le CSV
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Mappings" description="Vérifier les propositions">
          {analyzeResult && (
            <Paper p="md" withBorder>
              <Stack>
                {/* Statistiques principales */}
                <Alert color="blue" title="Statistiques">
                  <Text size="sm">
                    <strong>{analyzeResult.statistics.total_lines}</strong> lignes analysées •{' '}
                    <strong>{analyzeResult.statistics.valid_lines}</strong> valides •{' '}
                    <strong>{analyzeResult.statistics.unique_categories}</strong> catégories uniques •{' '}
                    <strong>{analyzeResult.statistics.mapped_categories}</strong> mappées •{' '}
                    <strong>{analyzeResult.statistics.unmapped_categories}</strong> non mappées
                  </Text>
                </Alert>

                {/* Barre de progression du mapping (T8) */}
                {analyzeResult.statistics.unique_categories > 0 && (
                  <Box>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Progression du mapping
                      </Text>
                      <Badge
                        color={
                          analyzeResult.statistics.unmapped_categories <= 5
                            ? 'green'
                            : analyzeResult.statistics.unmapped_categories <= 20
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {analyzeResult.statistics.mapped_categories} / {analyzeResult.statistics.unique_categories}
                      </Badge>
                    </Group>
                    <Progress
                      value={
                        (analyzeResult.statistics.mapped_categories /
                          analyzeResult.statistics.unique_categories) *
                        100
                      }
                      color={
                        analyzeResult.statistics.unmapped_categories <= 5
                          ? 'green'
                          : analyzeResult.statistics.unmapped_categories <= 20
                          ? 'yellow'
                          : 'red'
                      }
                      size="lg"
                      radius="xl"
                    />
                  </Box>
                )}

                {/* Statistiques LLM enrichies (T6) */}
                {analyzeResult.statistics.llm_provider_used === null &&
                  !analyzeResult.statistics.llm_attempted && (
                    <Text size="sm" c="dimmed">
                      LLM : Non utilisé (non configuré)
                    </Text>
                  )}

                {analyzeResult.statistics.llm_attempted && (
                  <Stack gap="xs">
                    {analyzeResult.statistics.llm_batches_failed === 0 &&
                      analyzeResult.statistics.llm_mapped_categories > 0 && (
                        <>
                          <Badge color="green" size="lg">
                            LLM `{analyzeResult.statistics.llm_model_used || 'non spécifié'}` :{' '}
                            <strong>{analyzeResult.statistics.llm_mapped_categories} catégories résolues</strong>
                          </Badge>
                          {analyzeResult.statistics.llm_avg_confidence !== null && (
                            <Text size="sm" c="dimmed">
                              Confiance moyenne : {analyzeResult.statistics.llm_avg_confidence.toFixed(1)}%
                            </Text>
                          )}
                        </>
                      )}

                    {analyzeResult.statistics.llm_batches_failed > 0 &&
                      analyzeResult.statistics.llm_batches_succeeded > 0 && (
                        <>
                          <Badge color="orange" size="lg">
                            LLM `{analyzeResult.statistics.llm_model_used || 'non spécifié'}` :{' '}
                            {analyzeResult.statistics.llm_mapped_categories} résolues,{' '}
                            <strong>{analyzeResult.statistics.llm_batches_failed} erreurs</strong>
                          </Badge>
                          <Alert color="yellow" title="Erreurs partielles">
                            Certains appels LLM ont échoué. Essayez un autre modèle ou relancez uniquement les
                            catégories restantes.
                            {analyzeResult.statistics.llm_last_error && (
                              <Text size="xs" mt="xs" c="red">
                                Détail : {analyzeResult.statistics.llm_last_error}
                              </Text>
                            )}
                          </Alert>
                        </>
                      )}

                    {(analyzeResult.statistics.llm_batches_failed ===
                      analyzeResult.statistics.llm_batches_total ||
                      analyzeResult.statistics.llm_mapped_categories === 0) &&
                      analyzeResult.statistics.llm_batches_total > 0 && (
                        <>
                          <Badge color="red" size="lg">
                            LLM `{analyzeResult.statistics.llm_model_used || 'non spécifié'}` :{' '}
                            <strong>Aucune catégorie résolue</strong> ({analyzeResult.statistics.llm_batches_failed}{' '}
                            erreurs)
                          </Badge>
                          <Alert color="red" title="Échec LLM">
                            Tous les appels LLM ont échoué. Vérifiez la configuration ou essayez un autre modèle.
                            {analyzeResult.statistics.llm_last_error && (
                              <Text size="xs" mt="xs">
                                Détail : {analyzeResult.statistics.llm_last_error}
                              </Text>
                            )}
                          </Alert>
                        </>
                      )}
                  </Stack>
                )}

                {/* Bouton Relancer LLM (T7) */}
                {analyzeResult &&
                  unmapped.length > 0 &&
                  selectedLlmModelId &&
                  analyzeResult.statistics.unmapped_categories > 0 && (
                    <Group mt="md">
                      <Button
                        variant="light"
                        color="blue"
                        onClick={handleRelaunchLLM}
                        disabled={relaunchingLlm}
                        loading={relaunchingLlm}
                        leftSection={<IconCheck size={16} />}
                      >
                        Relancer LLM pour les {unmapped.length} catégories restantes
                      </Button>
                    </Group>
                  )}

                {/* Tableau des mappings */}
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th
                        onClick={() => toggleSort('csv')}
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Catégorie CSV{renderSortIndicator('csv')}
                      </Table.Th>
                      <Table.Th
                        onClick={() => toggleSort('proposed')}
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Catégorie proposée{renderSortIndicator('proposed')}
                      </Table.Th>
                      <Table.Th
                        onClick={() => toggleSort('confidence')}
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Confiance{renderSortIndicator('confidence')}
                      </Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedMappingsEntries.map(([csvCategory, mapping]) => (
                      <Table.Tr key={csvCategory}>
                        <Table.Td>{csvCategory}</Table.Td>
                        <Table.Td>{mapping.category_name}</Table.Td>
                        <Table.Td>
                          <Badge color={getConfidenceColor(mapping.confidence)}>
                            {mapping.confidence.toFixed(0)}%
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Select
                            data={[
                              { value: mapping.category_id, label: mapping.category_name },
                              ...getCategoryOptions().filter(opt => opt.value !== mapping.category_id),
                              { value: '__reject__', label: 'Rejeter' }
                            ]}
                            value={mapping.category_id}
                            onChange={(value) => {
                              if (value === '__reject__') {
                                handleMappingChange(csvCategory, null);
                              } else if (value) {
                                handleMappingChange(csvCategory, value);
                              }
                              // Réinitialiser la recherche après sélection
                              setSearchValues(prev => {
                                const copy = { ...prev };
                                delete copy[`mapped:${csvCategory}`];
                                return copy;
                              });
                            }}
                            searchable
                            maxDropdownHeight={320}
                            nothingFoundMessage="Aucune catégorie trouvée"
                            searchValue={searchValues[`mapped:${csvCategory}`] || ''}
                            onSearchChange={(value) => {
                              setSearchValues(prev => ({
                                ...prev,
                                [`mapped:${csvCategory}`]: value,
                              }));
                            }}
                            placeholder="Choisir une catégorie"
                            style={{ minWidth: 200 }}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {/* Pagination simple pour limiter le nombre de lignes à l'écran */}
                {sortedMappingsEntries.length > pageSize && (
                  <Group justify="space-between" mt="sm">
                    <Text size="sm" c="dimmed">
                      Page {currentPage} / {totalPages} • {sortedMappingsEntries.length} catégories CSV
                    </Text>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Précédent
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Suivant
                      </Button>
                    </Group>
                  </Group>
                )}

                {/* Catégories non mappables */}
                {unmapped.length > 0 && (
                  <>
                    <Divider label="Catégories non mappables" labelPosition="center" />
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Catégorie CSV</Table.Th>
                          <Table.Th>Action</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {unmapped
                          .filter(cat => !rejectedCategories.has(cat))
                          .map((csvCategory) => (
                            <Table.Tr key={csvCategory}>
                              <Table.Td>{csvCategory}</Table.Td>
                              <Table.Td>
                                <Select
                                  data={[
                                    ...getCategoryOptions(),
                                    { value: '__reject__', label: 'Rejeter' }
                                  ]}
                                  searchable
                                  maxDropdownHeight={320}
                                  nothingFoundMessage="Aucune catégorie trouvée"
                                  placeholder="Mapper vers..."
                                  onChange={(value) => {
                                    if (value === '__reject__') {
                                      handleMappingChange(csvCategory, null);
                                    } else if (value) {
                                      handleMappingChange(csvCategory, value);
                                    }
                                    // Réinitialiser la recherche après sélection
                                    setSearchValues(prev => {
                                      const copy = { ...prev };
                                      delete copy[`unmapped:${csvCategory}`];
                                      return copy;
                                    });
                                  }}
                                  searchValue={searchValues[`unmapped:${csvCategory}`] || ''}
                                  onSearchChange={(value) => {
                                    setSearchValues(prev => ({
                                      ...prev,
                                      [`unmapped:${csvCategory}`]: value,
                                    }));
                                  }}
                                  searchable
                                  style={{ minWidth: 200 }}
                                />
                              </Table.Td>
                            </Table.Tr>
                          ))}
                      </Table.Tbody>
                    </Table>
                  </>
                )}

                {/* Catégories rejetées */}
                {rejectedCategories.size > 0 && (
                  <>
                    <Divider label="Catégories rejetées" labelPosition="center" />
                    <Alert color="orange" title="Catégories exclues de l'import">
                      {Array.from(rejectedCategories).join(', ')}
                    </Alert>
                  </>
                )}

                <Group mt="md">
                  <Button
                    variant="outline"
                    onClick={handleResetMappings}
                    leftSection={<IconX size={16} />}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    onClick={() => setActiveStep(2)}
                    leftSection={<IconCheck size={16} />}
                    disabled={unmapped.length > 0 && unmapped.length > 5}
                    title={
                      unmapped.length > 5
                        ? `Il reste ${unmapped.length} catégories non mappées. Vous pouvez continuer ou relancer le LLM.`
                        : undefined
                    }
                  >
                    Continuer
                    {unmapped.length > 0 && unmapped.length <= 5 && ` (${unmapped.length} non mappées)`}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}
        </Stepper.Step>

        <Stepper.Step label="Export" description="Télécharger le mapping">
          <Paper p="md" withBorder>
            <Stack>
              <Text size="sm" c="dimmed" mb="md">
                Téléchargez le fichier de mapping validé avant de procéder à l'import.
              </Text>
              
              <Button
                onClick={handleExportMapping}
                disabled={exporting || Object.keys(mappings).length === 0}
                loading={exporting}
                leftSection={<IconDownload size={16} />}
                fullWidth
              >
                Exporter le mapping
              </Button>
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Import" description="Exécuter l'import">
          <Paper p="md" withBorder>
            <Stack>
              {importing && (
                <Box>
                  <Text size="sm" mb="xs">Import en cours...</Text>
                  <Progress value={importProgress} animated />
                </Box>
              )}

              {importError && (
                <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
                  {importError}
                </Alert>
              )}

              {importReport && (
                <Alert color="green" title="Import terminé">
                  <Stack gap="xs">
                    <Text size="sm">
                      <strong>{importReport.postes_created}</strong> postes créés •{' '}
                      <strong>{importReport.postes_reused}</strong> réutilisés
                    </Text>
                    <Text size="sm">
                      <strong>{importReport.tickets_created}</strong> tickets créés •{' '}
                      <strong>{importReport.lignes_imported}</strong> lignes importées
                    </Text>
                    {importReport.total_errors > 0 && (
                      <Text size="sm" c="red">
                        <strong>{importReport.total_errors}</strong> erreur(s)
                      </Text>
                    )}
                    {importReport.errors.length > 0 && (
                      <Box mt="md">
                        <Text size="sm" fw={700} mb="xs">Erreurs:</Text>
                        {importReport.errors.map((error, idx) => (
                          <Text key={idx} size="xs" c="red">{error}</Text>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </Alert>
              )}

              <Button
                onClick={handleImport}
                disabled={importing || !csvFile || Object.keys(mappings).length === 0}
                loading={importing}
                leftSection={<IconDatabaseImport size={16} />}
                fullWidth
                mt="md"
              >
                Importer
              </Button>
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Completed>
          <Paper p="md" withBorder>
            <Alert color="green" title="Import terminé" icon={<IconCheck size={16} />}>
              L'import a été effectué avec succès. Vous pouvez consulter les données dans les sections appropriées.
            </Alert>
          </Paper>
        </Stepper.Completed>
      </Stepper>

      <Group justify="flex-end" mt="xl">
        {activeStep > 0 && (
          <Button variant="default" onClick={() => setActiveStep(activeStep - 1)}>
            Précédent
          </Button>
        )}
        {activeStep < 4 && activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep + 1)}>
            Suivant
          </Button>
        )}
      </Group>
    </Container>
  );
};

export default LegacyImport;

