import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Alert,
  Table,
  Badge,
  ActionIcon,
  Paper,
  Modal,
  LoadingOverlay,
  Box,
  Collapse,
  Menu,
  FileInput,
  Divider,
  Checkbox,
  Tabs
} from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconArchive,
  IconRestore
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Category, categoryService } from '../../services/categoryService';
import { CategoryForm } from '../../components/business/CategoryForm';
import { EnhancedCategorySelector } from '../../components/categories/EnhancedCategorySelector';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<{ session_id: string | null; summary: any; sample: any[]; errors: string[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [executeErrors, setExecuteErrors] = useState<string[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false); // Story B48-P1: Toggle pour afficher les éléments archivés

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories(undefined, includeArchived);
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des catégories');
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les catégories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeArchived]); // Story B48-P1: Recharger quand le toggle change

  // Déplier par défaut toutes les catégories racines
  useEffect(() => {
    const roots = organizeCategories(categories).map(c => c.id);
    setExpandedCategories(new Set(roots));
  }, [categories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleDownloadTemplate = async () => {
    await categoryService.downloadImportTemplate();
  };

  const handleAnalyzeImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    try {
      const res = await categoryService.importAnalyze(selectedFile);
      setAnalyzeResult(res);
    } catch (e) {
      notifications.show({ title: 'Erreur', message: 'Analyse du CSV échouée', color: 'red' });
    } finally {
      setImporting(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!analyzeResult?.session_id) return;
    setImporting(true);
    setExecuteErrors([]);
    try {
      const res = await categoryService.importExecute(analyzeResult.session_id, deleteExisting);
      if (res.errors?.length) {
        setExecuteErrors(res.errors);
        notifications.show({ 
          title: 'Import terminé avec erreurs', 
          message: `L'import s'est terminé avec ${res.errors.length} erreur(s). Voir les détails ci-dessous.`, 
          color: 'yellow' 
        });
      } else {
        const message = deleteExisting 
          ? 'Import réussi - Toutes les catégories et lignes de dépôt existantes ont été supprimées et remplacées'
          : 'Import réussi - Catégories mises à jour';
        notifications.show({ title: 'Import réussi', message, color: 'green' });
        setImportModalOpen(false);
        setAnalyzeResult(null);
        setSelectedFile(null);
        setDeleteExisting(false);
        setExecuteErrors([]);
        fetchCategories();
      }
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.message || 'Exécution de l\'import échouée';
      setExecuteErrors([errorMessage]);
      notifications.show({ 
        title: 'Erreur', 
        message: 'L\'import a échoué. Voir les détails ci-dessous.', 
        color: 'red' 
      });
    } finally {
      setImporting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (_category: Category) => {};

  const handleReactivate = async (category: Category) => {
    try {
      await categoryService.reactivateCategory(category.id);
      notifications.show({
        title: 'Succès',
        message: 'Catégorie réactivée avec succès',
        color: 'green',
      });
      fetchCategories();
    } catch (err: any) {
      notifications.show({
        title: 'Erreur',
        message: err.response?.data?.detail || 'Impossible de réactiver la catégorie',
        color: 'red',
      });
    }
  };

  // Story B48-P1: Restaurer une catégorie archivée
  const handleRestore = async (category: Category) => {
    try {
      await categoryService.restoreCategory(category.id);
      notifications.show({
        title: 'Succès',
        message: 'Catégorie restaurée avec succès',
        color: 'green',
      });
      fetchCategories();
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = 'Impossible de restaurer la catégorie';
      if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      } else if (errorDetail?.detail) {
        errorMessage = errorDetail.detail;
      }
      notifications.show({
        title: 'Erreur',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const handleSubmit = async (data: { name: string; official_name?: string | null; parent_id?: string | null; price?: number | null; max_price?: number | null }) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data);
        notifications.show({
          title: 'Succès',
          message: 'Catégorie mise à jour avec succès',
          color: 'green',
        });
      } else {
        await categoryService.createCategory(data);
        notifications.show({
          title: 'Succès',
          message: 'Catégorie créée avec succès',
          color: 'green',
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      notifications.show({
        title: 'Erreur',
        message: err.response?.data?.detail || 'Erreur lors de l\'enregistrement',
        color: 'red',
      });
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await categoryService.exportToPdf();
      notifications.show({
        title: 'Succès',
        message: 'Export PDF téléchargé avec succès',
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Erreur',
        message: err.response?.data?.detail || 'Erreur lors de l\'export PDF',
        color: 'red',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await categoryService.exportToExcel();
      notifications.show({
        title: 'Succès',
        message: 'Export Excel téléchargé avec succès',
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Erreur',
        message: err.response?.data?.detail || 'Erreur lors de l\'export Excel',
        color: 'red',
      });
    } finally {
      setExporting(false);
    }
  };

  // Fonction pour organiser les catégories en hiérarchie
  const organizeCategories = (categories: Category[]) => {
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    // Créer un map avec des enfants vides
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Organiser la hiérarchie
    categories.forEach(cat => {
      const categoryWithChildren = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  };

  // Fonction pour basculer l'expansion d'une catégorie
  const toggleExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Composant récursif pour afficher la hiérarchie
  const CategoryTreeItem: React.FC<{
    category: Category & { children: Category[] };
    level: number;
    includeArchived: boolean;
  }> = ({ category, level, includeArchived }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    const indent = level * 20;

    return (
      <>
        <tr key={category.id}>
          <td>
            <Group gap="xs" style={{ paddingLeft: indent }}>
              {hasChildren && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => toggleExpansion(category.id)}
                  data-testid={`expand-${category.id}`}
                >
                  {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </ActionIcon>
              )}
              {!hasChildren && <Box w={20} />}
              {/* Story B48-P1: Icône archive pour catégories archivées */}
              {category.deleted_at && (
                <IconArchive size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
              )}
              <Text 
                size="sm" 
                fw={level === 0 ? 600 : 400}
                style={{ 
                  opacity: category.deleted_at ? 0.6 : 1,
                  fontStyle: category.deleted_at ? 'italic' : 'normal',
                  color: category.deleted_at ? 'var(--mantine-color-gray-6)' : undefined
                }}
                title={category.official_name ? `Dénomination officielle : ${category.official_name}` : undefined}
              >
                {/* Story B48-P5: Nom court/rapide (toujours utilisé) */}
                {category.name}
              </Text>
            </Group>
          </td>
          <td>
            <Text 
              size="xs" 
              c="dimmed"
              style={{ 
                opacity: category.deleted_at ? 0.6 : 1,
                fontStyle: category.deleted_at ? 'italic' : 'normal'
              }}
              title={category.official_name ? `Dénomination officielle : ${category.official_name}` : undefined}
            >
              {category.official_name || '-'}  {/* Story B48-P5: Nom complet officiel (optionnel) */}
            </Text>
          </td>
          {/* Story B48-P1: Colonne date d'archivage - affichée uniquement si includeArchived */}
          {includeArchived && (
            <td>
              {category.deleted_at ? (
                <Text size="xs" c="dimmed">
                  {new Date(category.deleted_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              ) : (
                <Text size="xs" c="dimmed">—</Text>
              )}
            </td>
          )}
          <td>
            {category.price != null && Number(category.price) !== 0
              ? `${Number(category.price).toFixed(2)} €`
              : '—'}
          </td>
          <td>
            {category.max_price != null && Number(category.max_price) !== 0
              ? `${Number(category.max_price).toFixed(2)} €`
              : '—'}
          </td>
          <td>
            <Group gap="xs">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => handleEdit(category)}
                title="Modifier"
                data-testid={`edit-${category.id}`}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </Group>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          <>
            {category.children.map(child => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
                includeArchived={includeArchived}
              />
            ))}
          </>
        )}
      </>
    );
  };

  // Organiser les catégories en hiérarchie
  const hierarchicalCategories = organizeCategories(categories);

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Gestion des Catégories</Title>
            <Text c="dimmed" size="sm">
              Gérer les catégories de produits utilisées dans l'application
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              onClick={() => setImportModalOpen(true)}
              data-testid="import-button"
            >
              Importer
            </Button>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  loading={exporting}
                  data-testid="export-button"
                >
                  Exporter
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconFileTypePdf size={16} />}
                  onClick={handleExportPdf}
                  data-testid="export-pdf"
                >
                  Exporter en PDF
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={handleExportExcel}
                  data-testid="export-excel"
                >
                  Exporter en Excel
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={16} />}
                  onClick={async () => {
                    try {
                      await categoryService.exportToCsv();
                      notifications.show({ title: 'Succès', message: 'Export CSV téléchargé', color: 'green' });
                    } catch (e: any) {
                      notifications.show({ title: 'Erreur', message: e?.response?.data?.detail || 'Export CSV échoué', color: 'red' });
                    }
                  }}
                  data-testid="export-csv"
                >
                  Exporter CSV (ré-importable)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={fetchCategories}
              loading={loading}
            >
              Actualiser
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreate}
            >
              Nouvelle catégorie
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
            {error}
          </Alert>
        )}

        <Tabs defaultValue="management">
          <Tabs.List>
            <Tabs.Tab value="management">Gestion des catégories</Tabs.Tab>
            <Tabs.Tab value="visibility">Visibilité pour tickets de réception</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="management" pt="md">
            <Paper shadow="sm" p="md" withBorder pos="relative">
              <LoadingOverlay visible={loading} />
              {/* Story B48-P1: Toggle pour afficher les éléments archivés */}
              <Group mb="md" justify="space-between">
                <Checkbox
                  label="Afficher les éléments archivés"
                  checked={includeArchived}
                  onChange={(e) => setIncludeArchived(e.currentTarget.checked)}
                  data-testid="include-archived-toggle"
                />
              </Group>
              <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Nom d'affichage</th>
                <th>Nom complet officiel</th>
                {includeArchived && <th>Date d'archivage</th>}
                <th>Prix minimum</th>
                <th>Prix maximum</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hierarchicalCategories.length > 0 ? (
                hierarchicalCategories.map(category => (
                  <CategoryTreeItem
                    key={category.id}
                    category={category}
                    level={0}
                    includeArchived={includeArchived}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={includeArchived ? 6 : 5}>
                    <Text ta="center" c="dimmed">
                      Aucune catégorie trouvée
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="visibility" pt="md">
            <Paper shadow="sm" p="md" withBorder>
              <Stack gap="md">
                <Alert color="blue" title="Gestion de la visibilité">
                  <Text size="sm">
                    Utilisez les cases à cocher pour contrôler quelles catégories apparaissent dans les tickets ENTRY/DEPOT.
                    Les tickets SALE/CASH REGISTER affichent toujours toutes les catégories, indépendamment de ces paramètres.
                  </Text>
                </Alert>
                <EnhancedCategorySelector
                  showVisibilityControls={true}
                  showDisplayOrder={true}
                />
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      >
        <Stack>
          {/* Story B48-P1: Bouton Restaurer pour catégories archivées */}
          {editingCategory?.deleted_at && (
            <Alert color="blue" icon={<IconArchive size={16} />}>
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={500}>Cette catégorie est archivée</Text>
                  <Text size="xs" c="dimmed">
                    Archivée le {new Date(editingCategory.deleted_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </div>
                <Button
                  leftSection={<IconRestore size={16} />}
                  variant="light"
                  color="blue"
                  onClick={async () => {
                    if (!editingCategory) return;
                    if (window.confirm('Êtes-vous sûr de vouloir restaurer cette catégorie ?')) {
                      await handleRestore(editingCategory);
                      setModalOpen(false);
                    }
                  }}
                  data-testid="restore-category-button"
                >
                  Restaurer
                </Button>
              </Group>
            </Alert>
          )}
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            onDelete={async () => {
              if (!editingCategory) return;
              let hasUsage = true; // Default to true to be safe
              try {
                // Check if category has usage to decide between hard delete and soft delete
                const usage = await categoryService.checkCategoryUsage(editingCategory.id);
                hasUsage = usage.has_usage;
                
                if (!usage.has_usage) {
                  // No usage: hard delete (permanent deletion)
                  await categoryService.hardDeleteCategory(editingCategory.id);
                  notifications.show({ 
                    title: 'Catégorie supprimée', 
                    message: 'La catégorie a été supprimée définitivement car elle n\'était utilisée nulle part.', 
                    color: 'green' 
                  });
                } else {
                  // Has usage: soft delete (archive)
                  await categoryService.deleteCategory(editingCategory.id);
                  notifications.show({ 
                    title: 'Catégorie archivée', 
                    message: 'La catégorie a été archivée. Elle est masquée des sélecteurs mais reste disponible dans l\'historique.', 
                    color: 'green' 
                  });
                }
                setModalOpen(false);
                fetchCategories(); // Recharger pour mettre à jour l'affichage
              } catch (e: any) {
                const errorDetail = e?.response?.data?.detail;
                let errorMessage = hasUsage ? 'Archivage échoué' : 'Suppression échouée';
                if (typeof errorDetail === 'string') {
                  errorMessage = errorDetail;
                } else if (errorDetail?.detail) {
                  errorMessage = errorDetail.detail;
                }
                notifications.show({ 
                  title: 'Erreur', 
                  message: errorMessage, 
                  color: 'red' 
                });
              }
            }}
          />
        </Stack>
      </Modal>

      <Modal
        opened={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setExecuteErrors([]);
          setAnalyzeResult(null);
          setSelectedFile(null);
        }}
        title="Importer des Catégories"
        size="lg"
      >
        <Stack>
          <Group>
            <Button variant="subtle" onClick={handleDownloadTemplate}>Télécharger le modèle CSV</Button>
          </Group>
          <FileInput
            label="Fichier CSV"
            placeholder="Sélectionner un fichier .csv"
            value={selectedFile}
            onChange={setSelectedFile}
            accept=".csv"
          />
          <Checkbox
            label="Supprimer toutes les catégories existantes avant l'import"
            description="⚠️ Cette action est irréversible et supprimera aussi toutes les lignes de dépôt associées"
            checked={deleteExisting}
            onChange={(event) => {
              const isChecked = event.currentTarget.checked;
              if (isChecked) {
                notifications.show({
                  title: '⚠️ Attention - Suppression complète',
                  message: 'Vous êtes sur le point de supprimer TOUTES les catégories existantes ET toutes les lignes de dépôt associées. Cette action est irréversible et effacera toutes les données de dépôt historiques.',
                  color: 'red',
                  autoClose: 10000,
                });
              }
              setDeleteExisting(isChecked);
            }}
            color="red"
            data-testid="delete-existing-checkbox"
          />
          <Group>
            <Button onClick={handleAnalyzeImport} loading={importing} disabled={!selectedFile}>Analyser</Button>
            <Button onClick={handleExecuteImport} loading={importing} disabled={!analyzeResult?.session_id}>Exécuter</Button>
          </Group>
          {analyzeResult && (
            <>
              <Divider my="sm" />
              <Text size="sm">Résumé: total={analyzeResult.summary?.total} • à créer={analyzeResult.summary?.to_create} • à mettre à jour={analyzeResult.summary?.to_update}</Text>
              {analyzeResult.errors?.length ? (
                <Alert color="yellow" title="Erreurs d'analyse (aperçu)">
                  <div style={{ maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{analyzeResult.errors.join('\n')}</pre>
                  </div>
                </Alert>
              ) : (
                <Alert color="green" title="Analyse valide">Vous pouvez exécuter l'import.</Alert>
              )}
            </>
          )}
          {executeErrors.length > 0 && (
            <Alert color="red" title="Erreurs d'exécution" mt="md">
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.875rem' }}>
                  {executeErrors.join('\n\n')}
                </pre>
              </div>
            </Alert>
          )}
        </Stack>
      </Modal>
    </Container>
  );
};

export default AdminCategories;
