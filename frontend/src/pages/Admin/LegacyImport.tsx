/**
 * Page d'Import Legacy CSV (Story B47-P3)
 * Interface web pour valider et corriger les mappings de catégories proposés par le système
 * Accessible uniquement aux Administrateurs et Super-Administrateurs
 */

import React, { useState, useEffect } from 'react';
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
  Box
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
  };
  errors: string[];
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

    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await adminService.analyzeLegacyImport(csvFile);
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

  // Filtrer les catégories pour le dropdown
  const getCategoryOptions = () => {
    return categories
      .filter(cat => cat.is_active)
      .map(cat => ({
        value: cat.id,
        label: cat.name
      }));
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
                {/* Statistiques */}
                <Alert color="blue" title="Statistiques">
                  <Text size="sm">
                    <strong>{analyzeResult.statistics.total_lines}</strong> lignes analysées •{' '}
                    <strong>{analyzeResult.statistics.valid_lines}</strong> valides •{' '}
                    <strong>{analyzeResult.statistics.unique_categories}</strong> catégories uniques •{' '}
                    <strong>{analyzeResult.statistics.mapped_categories}</strong> mappées •{' '}
                    <strong>{analyzeResult.statistics.unmapped_categories}</strong> non mappées
                  </Text>
                </Alert>

                {/* Tableau des mappings */}
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Catégorie CSV</Table.Th>
                      <Table.Th>Catégorie proposée</Table.Th>
                      <Table.Th>Confiance</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.entries(mappings).map(([csvCategory, mapping]) => (
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
                            }}
                            searchable
                            placeholder="Choisir une catégorie"
                            style={{ minWidth: 200 }}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

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
                                  placeholder="Mapper vers..."
                                  onChange={(value) => {
                                    if (value === '__reject__') {
                                      handleMappingChange(csvCategory, null);
                                    } else if (value) {
                                      handleMappingChange(csvCategory, value);
                                    }
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
                  >
                    Continuer
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

