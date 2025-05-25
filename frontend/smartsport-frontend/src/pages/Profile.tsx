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
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyTournaments = async () => {
      try {
        const response = await tournaments.getMyTournaments();
        setMyTournaments(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tournois:', error);
        toast.error('Erreur lors de la récupération de vos tournois');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMyTournaments();
    }
  }, [user]);

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
          ) : myTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{tournament.nom}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{tournament.description}</p>
                    <div className="space-y-1">
                      <p><strong>Date de début:</strong> {new Date(tournament.date_debut).toLocaleDateString()}</p>
                      <p><strong>Date de fin:</strong> {new Date(tournament.date_fin).toLocaleDateString()}</p>
                      <p><strong>Statut:</strong> {tournament.statut}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>Vous n'êtes inscrit à aucun tournoi pour le moment.</p>
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