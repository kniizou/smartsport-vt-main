import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar'; // Assuming Navbar is in this path
import Footer from '@/components/Footer'; // Assuming Footer is in this path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy } from 'lucide-react';
import { tournaments } from '@/lib/api';
import { toast } from 'sonner';

interface Tournament {
  id: number;
  nom: string;
  description: string;
  type: string;
  date_debut: string;
  date_fin: string;
  prix_inscription: number;
  statut: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrolledTournaments, setEnrolledTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledTournaments();
    }
  }, [user]);

  const fetchEnrolledTournaments = async () => {
    try {
      const response = await tournaments.getMyTournaments();
      setEnrolledTournaments(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des tournois:', error);
      toast.error('Impossible de charger vos tournois inscrits');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    // This should ideally be handled by a protected route component
    // For now, redirect if not logged in (though AuthProvider also tries to load from localStorage)
    navigate('/login');
    return null; 
  }

  const handleLogout = () => {
    logout();
    navigate('/');
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
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes tournois inscrits</h2>
            <Button onClick={handleRegisterTournament} className="esports-gradient">
              S'inscrire à un tournoi
            </Button>
          </div>
          
          {isLoading ? (
            <p>Chargement de vos tournois...</p>
          ) : enrolledTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledTournaments.map((tournament) => (
                <Card key={tournament.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{tournament.nom}</CardTitle>
                    <Badge className={`${
                      tournament.statut === 'planifie' ? 'bg-accent' :
                      tournament.statut === 'en_cours' ? 'bg-destructive' :
                      'bg-muted'
                    }`}>
                      {tournament.statut === 'planifie' ? 'Planifié' :
                       tournament.statut === 'en_cours' ? 'En cours' :
                       'Terminé'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Du {new Date(tournament.date_debut).toLocaleDateString('fr-FR')} au {new Date(tournament.date_fin).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span className="text-sm">{tournament.prix_inscription}€</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => navigate(`/tournament/${tournament.id}`)}
                      >
                        Voir les détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Vous n'êtes inscrit à aucun tournoi pour le moment.</p>
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