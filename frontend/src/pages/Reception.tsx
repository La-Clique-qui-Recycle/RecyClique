import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Modal } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { Receipt, Plus, X, Eye, Calendar, User, Package, Weight, List, Clock } from 'lucide-react';
import { useReception } from '../contexts/ReceptionContext';
import { useAuthStore } from '../stores/authStore';
import { getReceptionTickets } from '../services/api';
import { UserRole } from '../services/adminService';
import { receptionService } from '../services/receptionService';

const ReceptionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #2e7d32;
  font-size: 2rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #333;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background: #d32f2f;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const NewTicketButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DeferredButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  background: #fff3e0;
  color: #f57c00;
  border: 2px solid #f57c00;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #f57c00;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  &:disabled {
    background: #ccc;
    color: #666;
    border-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ButtonIcon = styled.div`
  font-size: 32px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
`;

// Styles pour la section des tickets récents
const RecentTicketsSection = styled.div`
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  color: #2e7d32;
  font-size: 1.5rem;
`;

const TicketsList = styled.div`
  display: grid;
  gap: 15px;
`;

const TicketCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;

  &:hover {
    border-color: #2e7d32;
    background: #f1f8e9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const TicketId = styled.span`
  font-weight: 600;
  color: #2e7d32;
  font-size: 1.1rem;
`;

const TicketStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.status === 'closed' ? '#e8f5e8' : '#fff3e0'};
  color: ${props => props.status === 'closed' ? '#2e7d32' : '#f57c00'};
`;

const TicketInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
`;

const TicketActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background: #1b5e20;
  }
`;

const LoadingTickets = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const NoTickets = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
`;

const Reception: React.FC = () => {
  const navigate = useNavigate();
  const { poste, isLoading, error, isDeferredMode, posteDate, openPoste, closePoste, createTicket } = useReception();
  const user = useAuthStore((s) => s.currentUser);
  
  // État pour les tickets récents
  const [recentTickets, setRecentTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);
  
  // État pour le modal de saisie différée
  const [deferredModalOpen, setDeferredModalOpen] = useState(false);
  const [deferredDate, setDeferredDate] = useState<Date | null>(null);
  const [deferredDateError, setDeferredDateError] = useState<string | null>(null);
  
  // Vérifier si l'utilisateur peut accéder à la saisie différée
  const canUseDeferred = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  // Charger les tickets récents
  const loadRecentTickets = async () => {
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const response = await getReceptionTickets(1, 5); // 5 tickets récents
      setRecentTickets(response.tickets || []);
    } catch (err) {
      console.error('Erreur lors du chargement des tickets:', err);
      setTicketsError('Impossible de charger les tickets récents');
    } finally {
      setTicketsLoading(false);
    }
  };

  // Ouvrir automatiquement le poste au premier accès (seulement pour les utilisateurs non-admin)
  // Les admins choisissent manuellement entre mode normal et mode différé
  useEffect(() => {
    if (!poste && !isLoading && !error && !deferredModalOpen && !canUseDeferred) {
      openPoste().catch((err) => {
        console.error('Erreur lors de l\'ouverture du poste:', err);
      });
    }
  }, [poste, isLoading, error, openPoste, deferredModalOpen, canUseDeferred]);

  // Charger les tickets récents au montage du composant
  useEffect(() => {
    loadRecentTickets();
  }, []);

  const handleNewTicket = async () => {
    try {
      const ticketId = await createTicket();
      // Rediriger vers la page de saisie du ticket avec ID
      navigate(`/reception/ticket/${ticketId}`);
    } catch (err) {
      console.error('Erreur lors de la création du ticket:', err);
    }
  };

  const handleOpenNormalPoste = async () => {
    try {
      // Ouvrir le poste
      const newPoste = await openPoste();
      // Créer automatiquement un ticket et rediriger vers la page de saisie
      const ticket = await receptionService.createTicket(newPoste.id);
      const ticketId = (ticket as any).id;
      navigate(`/reception/ticket/${ticketId}`);
    } catch (err) {
      console.error('Erreur lors de l\'ouverture du poste:', err);
    }
  };

  const handleClosePoste = async () => {
    try {
      await closePoste();
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la fermeture du poste:', err);
    }
  };

  const handleOpenDeferredModal = async () => {
    // Si un poste est déjà ouvert, le fermer d'abord
    if (poste) {
      try {
        await closePoste();
      } catch (err) {
        console.error('Erreur lors de la fermeture du poste:', err);
        // Continuer quand même pour ouvrir le modal
      }
    }
    setDeferredModalOpen(true);
    setDeferredDate(null);
    setDeferredDateError(null);
  };

  const handleCloseDeferredModal = () => {
    setDeferredModalOpen(false);
    setDeferredDate(null);
    setDeferredDateError(null);
  };


  const handleOpenDeferredPoste = async () => {
    if (!deferredDate) {
      setDeferredDateError('Veuillez sélectionner une date');
      return;
    }
    
    if (deferredDateError) {
      return;
    }
    
    try {
      // S'assurer que deferredDate est un objet Date
      let dateToUse: Date;
      if (deferredDate instanceof Date) {
        dateToUse = deferredDate;
      } else if (typeof deferredDate === 'string') {
        dateToUse = new Date(deferredDate);
      } else {
        setDeferredDateError('Format de date invalide');
        return;
      }
      
      // Vérifier que la date est valide
      if (isNaN(dateToUse.getTime())) {
        setDeferredDateError('Date invalide');
        return;
      }
      
      // Convertir la date en ISO 8601 avec timezone UTC
      const dateStr = dateToUse.toISOString();
      const newPoste = await openPoste(dateStr);
      
      setDeferredModalOpen(false);
      setDeferredDate(null);
      setDeferredDateError(null);
      
      // Créer automatiquement un ticket et rediriger vers la page de saisie
      // Utiliser directement le poste retourné plutôt que celui du contexte
      try {
        const ticket = await receptionService.createTicket(newPoste.id);
        const ticketId = (ticket as any).id;
        navigate(`/reception/ticket/${ticketId}`);
      } catch (ticketErr) {
        console.error('Erreur lors de la création du ticket:', ticketErr);
        // Si la création du ticket échoue, on reste sur la page mais on affiche l'erreur
        setDeferredDateError('Poste ouvert mais erreur lors de la création du ticket');
      }
    } catch (err) {
      console.error('Erreur lors de l\'ouverture du poste différé:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ouverture du poste';
      setDeferredDateError(errorMessage);
    }
  };

  const handleViewTicket = (ticketId, ticketStatus) => {
    if (ticketStatus === 'closed') {
      // Rediriger vers la vue en lecture seule pour les tickets fermés
      navigate(`/reception/ticket/${ticketId}/view`);
    } else {
      // Rediriger vers l'interface de saisie pour les tickets ouverts
      navigate(`/reception/ticket/${ticketId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWeight = (weight) => {
    return `${parseFloat(weight).toFixed(2)} kg`;
  };

  if (isLoading && !poste) {
    return (
      <ReceptionContainer>
        <MainContent>
          <LoadingMessage>Ouverture du poste de réception...</LoadingMessage>
        </MainContent>
      </ReceptionContainer>
    );
  }

  if (error && !poste) {
    return (
      <ReceptionContainer>
        <MainContent>
          <ErrorMessage>
            {error}
            <br />
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Réessayer
            </button>
          </ErrorMessage>
        </MainContent>
      </ReceptionContainer>
    );
  }

  return (
    <ReceptionContainer>
      <Header>
        <Title>
          <Receipt size={32} />
          Module de Réception
          {isDeferredMode && posteDate && (
            <span style={{ 
              marginLeft: '15px', 
              fontSize: '0.8rem', 
              color: '#f57c00',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Clock size={16} />
              Saisie différée - {new Date(posteDate).toLocaleDateString('fr-FR')}
            </span>
          )}
        </Title>
        <UserInfo>
          <UserName>Bonjour, {user?.first_name || user?.last_name || user?.username || 'Utilisateur'}</UserName>
          <Button onClick={() => navigate('/admin/reception-sessions')} variant="light" size="sm">
            <List size={16} />
            Voir tous les tickets
          </Button>
          {poste && (
            <CloseButton onClick={handleClosePoste} disabled={isLoading}>
              <X size={20} />
              Terminer ma session
            </CloseButton>
          )}
        </UserInfo>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {/* Modal pour la saisie différée */}
      <Modal
        opened={deferredModalOpen}
        onClose={handleCloseDeferredModal}
        title="Saisie différée - Sélection de la date"
        size="md"
      >
        <div style={{ marginBottom: '20px' }}>
          <DatePickerInput
            label="Date du cahier"
            placeholder="Sélectionnez la date de réception"
            value={deferredDate}
            onChange={(date) => {
              // Le DatePickerInput peut retourner Date | null | dayjs.Dayjs
              // Convertir en Date si nécessaire
              let dateObj: Date | null = null;
              if (date) {
                if (date instanceof Date) {
                  dateObj = date;
                } else if (typeof date === 'string') {
                  dateObj = new Date(date);
                } else if (date && typeof date === 'object' && 'toDate' in date) {
                  // dayjs object
                  dateObj = (date as any).toDate();
                } else if (date && typeof date === 'object' && 'getTime' in date) {
                  // Autre objet avec getTime (compatible Date)
                  dateObj = new Date((date as any).getTime());
                } else {
                  console.error('Format de date inattendu:', date, typeof date);
                  setDeferredDateError('Format de date invalide');
                  return;
                }
                
                // Vérifier que la date est valide
                if (dateObj && !isNaN(dateObj.getTime())) {
                  const now = new Date();
                  if (dateObj > now) {
                    setDeferredDateError('La date ne peut pas être dans le futur');
                  } else {
                    setDeferredDateError(null);
                  }
                  setDeferredDate(dateObj);
                } else {
                  setDeferredDateError('Date invalide');
                  setDeferredDate(null);
                }
              } else {
                setDeferredDate(null);
                setDeferredDateError(null);
              }
            }}
            maxDate={new Date()}
            required
            error={deferredDateError}
            icon={<IconCalendar size={16} />}
            mb="md"
            description="Date réelle de réception (date du cahier papier)"
            data-testid="deferred-reception-date-picker"
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="outline" onClick={handleCloseDeferredModal}>
              Annuler
            </Button>
            <Button onClick={handleOpenDeferredPoste} disabled={!deferredDate || !!deferredDateError}>
              Ouvrir le poste
            </Button>
          </div>
        </div>
      </Modal>

      <MainContent>
        {!poste ? (
          <ButtonsContainer>
            <NewTicketButton onClick={handleOpenNormalPoste} disabled={isLoading}>
              <ButtonIcon>
                <Plus size={48} />
              </ButtonIcon>
              Ouvrir un poste de réception
            </NewTicketButton>
            {canUseDeferred && (
              <DeferredButton onClick={handleOpenDeferredModal} disabled={isLoading}>
                <Clock size={20} />
                Saisie différée
              </DeferredButton>
            )}
          </ButtonsContainer>
        ) : (
          <ButtonsContainer>
            <NewTicketButton onClick={handleNewTicket} disabled={isLoading}>
              <ButtonIcon>
                <Plus size={48} />
              </ButtonIcon>
              Créer un nouveau ticket de dépôt
            </NewTicketButton>
            {canUseDeferred && !isDeferredMode && (
              <DeferredButton onClick={handleOpenDeferredModal} disabled={isLoading}>
                <Clock size={20} />
                Passer en saisie différée
              </DeferredButton>
            )}
          </ButtonsContainer>
        )}
      </MainContent>

      {/* Section des tickets récents */}
      <RecentTicketsSection>
        <SectionTitle>
          <Receipt size={24} />
          Tickets Récents
        </SectionTitle>
        
        {ticketsLoading ? (
          <LoadingTickets>Chargement des tickets récents...</LoadingTickets>
        ) : ticketsError ? (
          <ErrorMessage>{ticketsError}</ErrorMessage>
        ) : recentTickets.length === 0 ? (
          <NoTickets>Aucun ticket de réception trouvé</NoTickets>
        ) : (
          <TicketsList>
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} onClick={() => handleViewTicket(ticket.id, ticket.status)}>
                <TicketHeader>
                  <TicketId>Ticket #{ticket.id.slice(-8)}</TicketId>
                  <TicketStatus status={ticket.status}>
                    {ticket.status === 'closed' ? 'Fermé' : 'Ouvert'}
                  </TicketStatus>
                </TicketHeader>
                
                <TicketInfo>
                  <InfoItem>
                    <Calendar size={16} />
                    {formatDate(ticket.created_at)}
                  </InfoItem>
                  <InfoItem>
                    <User size={16} />
                    {ticket.benevole_username}
                  </InfoItem>
                  <InfoItem>
                    <Package size={16} />
                    {ticket.total_lignes} article{ticket.total_lignes > 1 ? 's' : ''}
                  </InfoItem>
                  <InfoItem>
                    <Weight size={16} />
                    {formatWeight(ticket.total_poids)}
                  </InfoItem>
                </TicketInfo>
                
                <TicketActions>
                  <ViewButton onClick={(e) => {
                    e.stopPropagation();
                    handleViewTicket(ticket.id, ticket.status);
                  }}>
                    <Eye size={16} />
                    {ticket.status === 'closed' ? 'Voir les détails' : 'Modifier'}
                  </ViewButton>
                </TicketActions>
              </TicketCard>
            ))}
          </TicketsList>
        )}
      </RecentTicketsSection>
    </ReceptionContainer>
  );
};

export default Reception;


