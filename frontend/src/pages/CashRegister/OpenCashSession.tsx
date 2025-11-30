import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, TextInput, Select, Button, Group, Alert, LoadingOverlay } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';  // B44-P1
import { IconCash, IconUser, IconCurrencyEuro, IconAlertCircle, IconBuilding, IconCashRegister, IconCalendar } from '@tabler/icons-react';
import { useCashSessionStoreInjected, useCashStores } from '../../providers/CashStoreProvider';
import { cashSessionService } from '../../services/cashSessionService';
import { useAuthStore } from '../../stores/authStore';
import { CashRegistersApi, SitesApi } from '../../generated/api';

interface OpenCashSessionProps {
  onSessionOpened?: (sessionId: string) => void;
}

const OpenCashSession: React.FC<OpenCashSessionProps> = ({ onSessionOpened }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const { cashSessionStore, isVirtualMode, isDeferredMode } = useCashStores();  // B44-P1
  const { 
    openSession, 
    loading, 
    error, 
    clearError ,
    resumeSession,
    fetchCurrentSession  // B44-P1: Pour charger la session au montage en mode différé
  } = cashSessionStore;
  
  const basePath = isDeferredMode ? '/cash-register/deferred' : (isVirtualMode ? '/cash-register/virtual' : '/cash-register');

  const [formData, setFormData] = useState({
    operator_id: currentUser?.id || 'test-user-id',
    site_id: currentUser?.site_id || '',
    register_id: '',
    initial_amount: ''  // B44-P3: String vide pour afficher placeholder "0.00" en gris
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [sites, setSites] = useState<Array<{value: string, label: string}>>([]);
  const [cashRegisters, setCashRegisters] = useState<Array<{value: string, label: string}>>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingRegisters, setLoadingRegisters] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<{ is_active: boolean; session_id: string | null }>({ is_active: false, session_id: null });
  const [sessionDate, setSessionDate] = useState<Date | null>(null);  // B44-P1: Date de session pour saisie différée
  // Si on vient avec une intention de reprise, tenter immédiatement
  useEffect(() => {
    const tryImmediateResume = async () => {
      const st: any = location.state;
      if (st?.intent === 'resume' && st?.register_id) {
        if (isVirtualMode) {
          // En mode virtuel, vérifier la session depuis le store virtuel
          const { currentSession } = cashSessionStore;
          if (currentSession && currentSession.status === 'open') {
            navigate(`${basePath}/sale`);
          }
        } else if (isDeferredMode) {
          // B44-P1: En mode différé, vérifier que la session est bien différée
          const { currentSession } = cashSessionStore;
          if (currentSession && currentSession.status === 'open' && currentSession.opened_at) {
            const openedAtDate = new Date(currentSession.opened_at);
            const now = new Date();
            if (openedAtDate < now) {
              // Session différée valide
              navigate(`${basePath}/sale`);
            }
            // Sinon, ne pas reprendre (session normale)
          }
        } else {
          // Mode réel : vérifier via l'API
        const status = await cashSessionService.getRegisterSessionStatus(st.register_id);
        if (status.is_active && status.session_id) {
          const ok = await resumeSession(status.session_id);
          if (ok) {
              navigate(`${basePath}/sale`);
            }
          }
        }
      }
    };
    tryImmediateResume();
  }, [location.state, navigate, resumeSession, isVirtualMode, isDeferredMode, cashSessionStore, basePath]);

  // Effacer les erreurs au montage du composant
  useEffect(() => {
    clearError();
  }, [clearError]);

  // B44-P1: Charger la session actuelle au montage en mode différé pour vérifier l'état réel
  const fetchCurrentSessionRef = useRef(fetchCurrentSession);
  useEffect(() => {
    fetchCurrentSessionRef.current = fetchCurrentSession;
  }, [fetchCurrentSession]);
  
  useEffect(() => {
    if (isDeferredMode) {
      fetchCurrentSessionRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeferredMode]); // fetchCurrentSession est mis à jour via ref pour éviter les boucles infinies

  // Charger les sites au montage
  useEffect(() => {
    loadSites();
  }, []);

  // Charger les caisses quand le site change
  useEffect(() => {
    if (formData.site_id) {
      loadCashRegisters(formData.site_id);
    } else {
      setCashRegisters([]);
      setFormData(prev => ({ ...prev, register_id: '' }));
    }
  }, [formData.site_id]);

  // UX-B10: Vérifier le statut de la caisse quand le register_id change (mode réel uniquement)
  useEffect(() => {
    if (isVirtualMode) {
      // En mode virtuel, vérifier depuis le store
      const { currentSession } = cashSessionStore;
      setRegisterStatus({
        is_active: currentSession?.status === 'open' || false,
        session_id: currentSession?.id || null
      });
      return;
    }
    
    if (isDeferredMode) {
      // B44-P1: En mode différé, vérifier que la session est bien différée (opened_at dans le passé) ET OUVERTE
      const { currentSession } = cashSessionStore;
      if (currentSession?.status === 'open' && currentSession.opened_at) {
        const openedAtDate = new Date(currentSession.opened_at);
        const now = new Date();
        // Session différée valide uniquement si opened_at est dans le passé ET status est 'open'
        if (openedAtDate < now) {
          setRegisterStatus({
            is_active: true,
            session_id: currentSession.id
          });
        } else {
          // Session normale trouvée, ne pas l'utiliser en mode différé
          setRegisterStatus({
            is_active: false,
            session_id: null
          });
        }
      } else {
        // Pas de session, session fermée, ou session sans opened_at
        setRegisterStatus({
          is_active: false,
          session_id: null
        });
      }
      return;
    }
    
    const checkRegisterStatus = async () => {
      if (!formData.register_id) {
        setRegisterStatus({ is_active: false, session_id: null });
        return;
      }
      const status = await cashSessionService.getRegisterSessionStatus(formData.register_id);
      setRegisterStatus(status);
    };
    checkRegisterStatus();
  }, [formData.register_id, isVirtualMode, isDeferredMode, cashSessionStore]);

  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const response = await SitesApi.sitesapiv1sitesget();
      // Mapping robuste des réponses
      const sitesData = Array.isArray(response) ? response :
        (Array.isArray(response?.data) ? response.data :
        (Array.isArray(response?.sites) ? response.sites : []));
      
      const sitesOptions = sitesData.map(site => ({
        value: site.id,
        label: `${site.name} (${site.location || 'Sans localisation'})`
      }));
      setSites(sitesOptions);
      
      // Pré-sélectionner le premier site
      if (sitesOptions.length > 0) {
        setFormData(prev => ({ ...prev, site_id: sitesOptions[0].value }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  const loadCashRegisters = async (siteId: string) => {
    setLoadingRegisters(true);
    try {
      const response = await CashRegistersApi.cashregistersapiv1cashregistersget({ site_id: siteId });
      // Mapping robuste des réponses
      const registersData = Array.isArray(response) ? response :
        (Array.isArray(response?.data) ? response.data :
        (Array.isArray(response?.registers) ? response.registers : []));
      
      const registersOptions = registersData.map(register => ({
        value: register.id,
        label: `${register.name} (${register.location || 'Sans localisation'})`
      }));
      setCashRegisters(registersOptions);
      
      // Pré-sélectionner la première caisse
      if (registersOptions.length > 0) {
        setFormData(prev => ({ ...prev, register_id: registersOptions[0].value }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des caisses:', error);
      setCashRegisters([]);
    } finally {
      setLoadingRegisters(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // B44-P3: Gestion spéciale de la saisie du montant initial (support point/virgule)
  // Format français : affichage avec virgule, conversion en point au submit
  const handleInitialAmountChange = (value: string) => {
    // Accepter uniquement les chiffres, point et virgule
    let sanitized = value.replace(/[^\d.,]/g, '');
    
    // Normaliser : remplacer tous les points par des virgules pour l'affichage français
    // (on garde la virgule pour l'affichage, conversion en point au submit)
    sanitized = sanitized.replace(/\./g, ',');
    
    // Valider le format : max 2 décimales, un seul séparateur décimal
    const parts = sanitized.split(',');
    if (parts.length > 2) {
      // Plusieurs virgules : garder seulement la première
      sanitized = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limiter à 2 décimales
    if (parts.length === 2 && parts[1].length > 2) {
      sanitized = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    // Permettre la saisie d'une virgule seule (ex: "50," pour taper "50,20")
    // ou une chaîne vide pour réinitialiser
    if (sanitized === '' || sanitized === ',') {
      setFormData(prev => ({
        ...prev,
        initial_amount: sanitized
      }));
    } else {
      // Valider le format avec regex : /^\d*,?\d{0,2}$/ (virgule pour affichage français)
      const isValidFormat = /^\d*,?\d{0,2}$/.test(sanitized);
      if (isValidFormat) {
        setFormData(prev => ({
          ...prev,
          initial_amount: sanitized
        }));
      }
      // Si format invalide, ne pas mettre à jour (garder la valeur précédente)
    }
    
    // Effacer l'erreur de validation
    if (validationErrors.initial_amount) {
      setValidationErrors(prev => ({
        ...prev,
        initial_amount: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.operator_id) {
      errors.operator_id = 'Veuillez sélectionner un opérateur';
    } else if (!/^[0-9a-fA-F-]{36}$/.test(formData.operator_id)) {
      errors.operator_id = 'ID opérateur invalide';
    }

    if (!formData.site_id) {
      errors.site_id = 'Veuillez sélectionner un site';
    } else if (!/^[0-9a-fA-F-]{36}$/.test(formData.site_id)) {
      errors.site_id = 'ID site invalide';
    }

    if (!formData.register_id) {
      errors.register_id = 'Veuillez sélectionner une caisse';
    } else if (!/^[0-9a-fA-F-]{36}$/.test(formData.register_id)) {
      errors.register_id = 'ID caisse invalide';
    }

    // B44-P3: Validation du montant initial (string avec virgule pour format français)
    const initialAmountStr = formData.initial_amount.toString().trim();
    if (initialAmountStr === '' || initialAmountStr === ',') {
      errors.initial_amount = 'Veuillez saisir un montant initial';
    } else {
      // Convertir virgule en point pour la validation numérique
      const initialAmountNum = parseFloat(initialAmountStr.replace(',', '.'));
      if (isNaN(initialAmountNum)) {
        errors.initial_amount = 'Montant invalide';
      } else if (initialAmountNum < 0) {
        errors.initial_amount = 'Le montant initial ne peut pas être négatif';
      } else if (initialAmountNum > 10000) {
        errors.initial_amount = 'Le montant initial ne peut pas dépasser 10 000€';
      }
    }

    // B44-P1: Validation de la date de session pour saisie différée
    if (isDeferredMode) {
      if (!sessionDate) {
        errors.sessionDate = 'Veuillez sélectionner une date de session';
      } else {
        const now = new Date();
        now.setHours(0, 0, 0, 0);  // Comparer seulement les dates, pas les heures
        const selectedDate = new Date(sessionDate);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > now) {
          errors.sessionDate = 'La date de session ne peut pas être dans le futur';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Logging en dev
    if (import.meta.env.MODE !== 'production') {
      console.debug('Payload session:', formData);
      console.debug('Types des valeurs:', {
        operator_id_type: typeof formData.operator_id,
        site_id_type: typeof formData.site_id,
        register_id_type: typeof formData.register_id,
        initial_amount_type: typeof formData.initial_amount
      });
    }

    try {
      // UX-B10: si une session est active pour cette caisse, reprendre
      // B44-P1: En mode différé, ne PAS reprendre une session normale existante
      if (!isVirtualMode && !isDeferredMode && registerStatus.is_active && registerStatus.session_id) {
        // En mode réel uniquement : vérifier via l'API
        const ok = await resumeSession(registerStatus.session_id);
        if (ok) {
          if (onSessionOpened) {
            onSessionOpened(registerStatus.session_id);
          } else {
            navigate(`${basePath}/sale`);
          }
          return;
        }
      }
      
      // En mode virtuel ou différé, vérifier la session depuis le store
      if (isVirtualMode || isDeferredMode) {
        const { currentSession } = cashSessionStore;
        if (currentSession && currentSession.status === 'open') {
          // B44-P1: En mode différé, vérifier que c'est bien une session différée
          if (isDeferredMode) {
            const openedAtDate = new Date(currentSession.opened_at);
            const now = new Date();
            if (openedAtDate >= now) {
              // Session normale trouvée, ne pas la reprendre en mode différé
              console.warn('[handleSubmit] Session normale trouvée en mode différé, création d\'une nouvelle session');
            } else {
              // Session différée valide
              navigate(`${basePath}/sale`);
              return;
            }
          } else {
            // Mode virtuel
            navigate(`${basePath}/sale`);
            return;
          }
        }
      }

      // B44-P1: Inclure opened_at si mode différé et date fournie
      // B44-P3: Convertir initial_amount de string (format français avec virgule) à number (point) pour l'API
      const initialAmountStr = formData.initial_amount.toString().trim();
      if (initialAmountStr === '' || initialAmountStr === ',') {
        setValidationErrors({ initial_amount: 'Veuillez saisir un montant initial' });
        return;
      }
      // Convertir virgule en point pour parseFloat
      const initialAmountNum = parseFloat(initialAmountStr.replace(',', '.'));
      if (isNaN(initialAmountNum)) {
        setValidationErrors({ initial_amount: 'Montant invalide' });
        return;
      }
      
      const sessionData: any = {
        operator_id: formData.operator_id,
        site_id: formData.site_id,
        register_id: formData.register_id,
        initial_amount: initialAmountNum
      };
      
      if (isDeferredMode && sessionDate) {
        // Convertir la date en ISO 8601 avec timezone UTC
        // DatePickerInput peut retourner Date, string, ou dayjs selon la version
        // IMPORTANT: On doit créer une date à minuit UTC pour éviter les problèmes de timezone
        let dateObj: Date;
        
        if (sessionDate instanceof Date) {
          dateObj = sessionDate;
        } else if (typeof sessionDate === 'string') {
          // Si c'est déjà une string, vérifier le format et convertir si nécessaire
          dateObj = new Date(sessionDate);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Date invalide');
          }
        } else if (sessionDate && typeof sessionDate === 'object' && 'toDate' in sessionDate) {
          // dayjs object
          dateObj = (sessionDate as any).toDate();
        } else if (sessionDate && typeof sessionDate === 'object' && 'getTime' in sessionDate) {
          // Autre objet avec getTime (compatible Date)
          dateObj = new Date((sessionDate as any).getTime());
        } else {
          console.error('Format de date inattendu:', sessionDate, typeof sessionDate);
          throw new Error('Format de date non supporté');
        }
        
        // Créer une date à minuit UTC pour la date sélectionnée (évite les problèmes de timezone)
        // On extrait l'année, le mois et le jour de la date sélectionnée
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
        
        // Créer une nouvelle date à minuit UTC avec ces valeurs
        const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        const dateStr = utcDate.toISOString();
        
        sessionData.opened_at = dateStr;
        console.log('[handleSubmit] Using deferred date:', dateStr, 'from selected date:', dateObj, 'UTC date:', utcDate);
      }

      console.log('[handleSubmit] Opening session with data:', sessionData);
      const session = await openSession(sessionData);

      if (session) {
        console.log('[handleSubmit] Session opened successfully:', session);
        // Redirection vers l'interface de vente
        if (onSessionOpened) {
          onSessionOpened(session.id);
        } else {
          navigate(`${basePath}/sale`);
        }
      } else {
        console.error('[handleSubmit] Session is null, error should be set in store');
        // L'erreur devrait être dans le store, mais on peut aussi vérifier ici
        const storeError = cashSessionStore.error;
        if (storeError) {
          console.error('[handleSubmit] Store error:', storeError);
        }
      }
    } catch (error) {
      console.error('[handleSubmit] Exception during session opening:', error);
      // L'erreur devrait être gérée par le store, mais on peut aussi l'afficher ici
      const storeError = cashSessionStore.error;
      if (storeError) {
        console.error('[handleSubmit] Store error after exception:', storeError);
      }
    }
  };

  const handleCancel = () => {
    // Retourner au dashboard approprié selon le mode
    if (isDeferredMode) {
      navigate('/cash-register/deferred');
    } else {
      navigate(isVirtualMode ? '/cash-register/virtual' : '/caisse');
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <LoadingOverlay visible={loading} />
        
        <Group mb="xl">
          <IconCash size={32} color="#228be6" />
          <Title order={2}>Ouverture de Session de Caisse</Title>
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={error.includes('déjà ouverte') ? 'Session existante' : 'Erreur'}
            color={error.includes('déjà ouverte') ? 'blue' : 'red'}
            mb="md"
            onClose={clearError}
            withCloseButton
          >
            {error}
            {error.includes('déjà ouverte') && (
              <Group mt="sm">
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => navigate(`${basePath}/sale`)}
                >
                  Aller à la vente
                </Button>
              </Group>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Select
            label="Opérateur"
            placeholder="Sélectionnez l'opérateur"
            value={formData.operator_id}
            onChange={(value) => handleInputChange('operator_id', value || '')}
            data={[
              { value: currentUser?.id || 'test-user-id', label: currentUser?.username || 'Utilisateur actuel' }
            ]}
            required
            error={validationErrors.operator_id}
            icon={<IconUser size={16} />}
            mb="md"
          />

          <Select
            label="Site"
            placeholder="Sélectionnez un site"
            value={formData.site_id}
            onChange={(value) => handleInputChange('site_id', value || '')}
            data={sites}
            required
            error={validationErrors.site_id}
            icon={<IconBuilding size={16} />}
            mb="md"
            loading={loadingSites}
            disabled={loadingSites}
            description="Choisissez le site où vous travaillez"
          />

          <Select
            label="Caisse"
            placeholder="Sélectionnez une caisse"
            value={formData.register_id}
            onChange={(value) => handleInputChange('register_id', value || '')}
            data={cashRegisters}
            required
            error={validationErrors.register_id}
            icon={<IconCashRegister size={16} />}
            mb="md"
            loading={loadingRegisters}
            disabled={loadingRegisters || !formData.site_id}
            description={!formData.site_id ? "Sélectionnez d'abord un site" : "Choisissez la caisse à utiliser"}
          />

          {/* B44-P1: DatePicker pour saisie différée */}
          {isDeferredMode && (
            <DatePickerInput
              label="Date du cahier"
              placeholder="Sélectionnez la date de vente"
              value={sessionDate}
              onChange={setSessionDate}
              maxDate={new Date()}  // Pas de date future
              required
              error={validationErrors.sessionDate}
              icon={<IconCalendar size={16} />}
              mb="md"
              description="Date réelle de vente (date du cahier papier)"
              data-testid="deferred-session-date-picker"
            />
          )}

          <TextInput
            label="Fond de caisse initial"
            placeholder="0.00"
            value={formData.initial_amount}
            onChange={(e) => handleInitialAmountChange(e.target.value)}
            type="text"
            required
            error={validationErrors.initial_amount}
            icon={<IconCurrencyEuro size={16} />}
            mb="xl"
            description="Montant en euros (ex: 50.00 ou 50,00)"
            data-testid="initial-amount-input"
            autoFocus
          />
          {/* Erreur rendue via TextInput.error pour éviter les doublons */}

          <Group position="right">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            {registerStatus.is_active ? (
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconCash size={16} />}
                color="green"
              >
                Reprendre la Session
              </Button>
            ) : (
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconCash size={16} />}
              >
                Ouvrir la Session
              </Button>
            )}
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default OpenCashSession;
