import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy, MapPin, Loader2 } from 'lucide-react';
import { tournaments } from '@/lib/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface Tournament {
  id: number;
  nom: string;
  description: string;
  type: string;
  date_debut: string;
  date_fin: string;
  prix_inscription: number;
  statut: string;
  location?: string;
  format?: string;
  registeredTeams?: number;
  teamsCount?: number;
}

interface ApiErrorResponse {
  detail: string;
}

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const getStatusBadge = (statut: string) => {
  const statusConfig: Record<string, { label: string; variant: StatusVariant }> = {
    'planifie': { label: 'Planifié', variant: 'secondary' },
    'en_cours': { label: 'En cours', variant: 'default' },
    'termine': { label: 'Terminé', variant: 'destructive' },
    'annule': { label: 'Annulé', variant: 'outline' }
  };

  const config = statusConfig[statut] || { label: statut, variant: 'secondary' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyTournaments = async () => {
      if (!user) return;
      
      try {
        const response = await tournaments.getMyTournaments();
        setMyTournaments(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tournois:', error);
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.detail || 'Erreur lors de la récupération de vos tournois';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTournaments();
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateTournament = () => {
    navigate('/organisateur/tournois/nouveau');
  };

  const handleRegisterTournament = () => {
    navigate('/inscription-tournoi');
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Profil de {user.first_name || user.email}</h1>
        
        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3">Informations personnelles</h2>
          <p><strong>Email:</strong> {user.email}</p>
          {user.first_name && <p><strong>Prénom:</strong> {user.first_name}</p>}
          {user.last_name && <p><strong>Nom:</strong> {user.last_name}</p>}
          <p><strong>Rôle:</strong> {user.role}</p>
          {user.role === 'organisateur' && (
            <Button 
              onClick={() => navigate('/organisateur/dashboard')} 
              className="mt-4 esports-gradient"
            >
              Dashboard
            </Button>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {user.role === 'organisateur' ? 'Mes tournois' : 'Mes tournois inscrits'}
            </h2>
            {user.role === 'organisateur' ? (
              <Button onClick={handleCreateTournament} className="esports-gradient">
                Créer un tournoi
              </Button>
            ) : (
              <Button onClick={handleRegisterTournament} className="esports-gradient">
                S'inscrire à un tournoi
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">{tournament.nom}</CardTitle>
                    {getStatusBadge(tournament.statut)}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tournament.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {new Date(tournament.date_debut).toLocaleDateString('fr-FR')} - {new Date(tournament.date_fin).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {tournament.location && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{tournament.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Trophy className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{tournament.prix_inscription}€</span>
                      </div>
                      {tournament.registeredTeams !== undefined && tournament.teamsCount !== undefined && (
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{tournament.registeredTeams}/{tournament.teamsCount} équipes</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate(`/tournois/${tournament.id}`)}
                    >
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {user.role === 'organisateur' 
                  ? "Vous n'avez pas encore créé de tournoi."
                  : "Vous n'êtes inscrit à aucun tournoi pour le moment."}
              </p>
              <Button 
                onClick={user.role === 'organisateur' ? handleCreateTournament : handleRegisterTournament}
                className="esports-gradient"
              >
                {user.role === 'organisateur' ? 'Créer un tournoi' : 'Découvrir les tournois'}
              </Button>
            </div>
          )}
        </div>

        <Button onClick={handleLogout} variant="destructive" className="mt-8">
          Se déconnecter
        </Button>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;