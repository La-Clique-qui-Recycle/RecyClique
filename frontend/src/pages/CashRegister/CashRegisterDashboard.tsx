import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cashRegisterDashboardService, cashSessionService } from '../../services/cashSessionService';
import { Card, Badge, Group, Button, SimpleGrid, Title, Container, LoadingOverlay, Text } from '@mantine/core';
import { useCashSessionStoreInjected, useCashStores } from '../../providers/CashStoreProvider';
import { PlayCircle } from 'lucide-react';

interface RegisterStatus {
  id: string;
  name: string;
  is_open: boolean;
}

const RegisterCard: React.FC<{ reg: RegisterStatus; onOpen: (id: string) => void; onResume: (id: string) => void }>
  = ({ reg, onOpen, onResume }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" mb="xs">
        <Title order={4}>{reg.name}</Title>
        <Badge color={reg.is_open ? 'green' : 'gray'}>{reg.is_open ? 'Ouverte' : 'Fermée'}</Badge>
      </Group>
      <Group position="right">
        {reg.is_open ? (
          <Button color="green" onClick={() => onResume(reg.id)}>Reprendre</Button>
        ) : (
          <Button onClick={() => onOpen(reg.id)}>Ouvrir</Button>
        )}
      </Group>
    </Card>
  );
};

const CashRegisterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cashSessionStore, isVirtualMode } = useCashStores();
  const { resumeSession } = cashSessionStore;
  const [loading, setLoading] = useState(true);
  const [registers, setRegisters] = useState<RegisterStatus[]>([]);

  // En mode virtuel, ne pas charger les caisses réelles
  useEffect(() => {
    if (isVirtualMode) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const list = await cashRegisterDashboardService.getRegistersStatus();
        setRegisters(list);
      } catch (error) {
        console.error('Erreur lors du chargement des caisses:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isVirtualMode]);

  const handleOpen = (registerId: string) => {
    const basePath = isVirtualMode ? '/cash-register/virtual' : '/cash-register';
    navigate(`${basePath}/session/open`, { state: { register_id: registerId } });
  };

  const handleResume = async (registerId: string) => {
    const basePath = isVirtualMode ? '/cash-register/virtual' : '/cash-register';
    
    if (isVirtualMode) {
      // En mode virtuel, utiliser le store virtuel directement
      const { currentSession } = cashSessionStore;
      if (currentSession && currentSession.status === 'open') {
        navigate(`${basePath}/sale`);
        return;
      }
      // Sinon, ouvrir une nouvelle session
      navigate(`${basePath}/session/open`);
      return;
    }

    // Mode réel : récupérer l'ID de session ouverte et reprendre immédiatement
    const status = await cashSessionService.getRegisterSessionStatus(registerId);
    if (status.is_active && status.session_id) {
      const ok = await resumeSession(status.session_id);
      if (ok) {
        navigate(`${basePath}/sale`);
        return;
      }
    }
    // Fallback 1: essayer la session courante opérateur
    const current = await cashSessionService.getCurrentSession();
    if (current && current.status === 'open') {
      // Hydrater le store et naviguer
      // On réutilise resumeSession pour persistance + état
      const ok2 = await resumeSession(current.id);
      if (ok2) {
        navigate(`${basePath}/sale`);
        return;
      }
    }
    // Fallback: si pas de session détectée, aller à l'ouverture
    navigate(`${basePath}/session/open`, { state: { register_id: registerId } });
  };

  const handleVirtualCashRegister = () => {
    navigate('/cash-register/virtual');
  };

  const handleOpenVirtualSession = () => {
    navigate('/cash-register/virtual/session/open');
  };

  const handleResumeVirtualSession = async () => {
    // Vérifier s'il y a une session virtuelle active
    const { currentSession } = cashSessionStore;
    if (currentSession && currentSession.status === 'open') {
      navigate('/cash-register/virtual/sale');
    } else {
      // Pas de session active, ouvrir une nouvelle session
      navigate('/cash-register/virtual/session/open');
    }
  };

  // Interface virtuelle : afficher uniquement la carte virtuelle
  if (isVirtualMode) {
    const { currentSession } = cashSessionStore;
    const hasActiveSession = currentSession && currentSession.status === 'open';
    
    return (
      <Container size="lg" py="xl">
        <Title order={2} mb="lg">Caisse Virtuelle - Mode Entraînement</Title>
        <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Card 
            shadow="sm" 
            padding="xl" 
            radius="md" 
            withBorder
            style={{ 
              borderStyle: 'dashed',
              borderColor: '#667eea',
              backgroundColor: '#f8f9fa',
              borderWidth: '2px'
            }}
          >
            <Group position="apart" mb="md">
              <Group spacing="xs">
                <PlayCircle size={24} color="#667eea" />
                <Title order={3}>Caisse Virtuelle</Title>
              </Group>
              <Badge color="blue" variant="filled" size="lg">MODE FORMATION</Badge>
            </Group>
            <Text size="md" mb="xl" c="dimmed">
              Mode d'entraînement sans impact sur les données réelles. 
              Toutes les opérations sont simulées localement.
            </Text>
            <Group position="right">
              <Button 
                color="blue" 
                variant="filled"
                size="lg"
                onClick={handleOpenVirtualSession}
                leftSection={<PlayCircle size={20} />}
              >
                Ouvrir une Session d'Entraînement
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={handleResumeVirtualSession}
                disabled={!hasActiveSession}
              >
                Reprendre la Session
              </Button>
            </Group>
          </Card>
        </SimpleGrid>
      </Container>
    );
  }

  // Interface réelle : afficher les caisses réelles + carte virtuelle
  return (
    <Container size="lg" py="xl">
      <LoadingOverlay visible={loading} />
      <Title order={2} mb="lg">Sélection du Poste de Caisse</Title>
      <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        {registers.map(reg => (
          <RegisterCard key={reg.id} reg={reg} onOpen={handleOpen} onResume={handleResume} />
        ))}
        {/* Carte Caisse Virtuelle pour la simulation */}
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder
          style={{ 
            borderStyle: 'dashed',
            borderColor: '#868e96',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Group position="apart" mb="xs">
            <Group spacing="xs">
              <PlayCircle size={20} color="#868e96" />
              <Title order={4} c="dimmed">Caisse Virtuelle</Title>
            </Group>
            <Badge color="blue" variant="light">Simulation</Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Mode d'entraînement sans impact sur les données réelles
          </Text>
          <Group position="right">
            <Button 
              color="blue" 
              variant="light"
              onClick={handleVirtualCashRegister}
              leftSection={<PlayCircle size={16} />}
            >
              Simuler
            </Button>
          </Group>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default CashRegisterDashboard;


