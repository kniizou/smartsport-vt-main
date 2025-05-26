import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Interface pour les données de Tournoi (à adapter selon le serializer)
interface TournoiData {
  id: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  // Ajoutez d'autres champs si nécessaire
}

interface InscriptionData {
  id: number;
  tournoi: TournoiData;
  joueur: {
    utilisateur: {
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  jeu: string;
  pseudo: string;
  niveau: string;
  experience: string;
  commentaire: string;
  statut: string;
  date_inscription: string;
}

const OrganisateurDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tournois, setTournois] = useState<TournoiData[]>([]);
  const [inscriptions, setInscriptions] = useState<InscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'organisateur') {
      toast.error("Accès non autorisé.");
      navigate('/'); // Rediriger si pas organisateur
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tournoisResponse, inscriptionsResponse] = await Promise.all([
          api.get('/api/tournois/mes_tournois/'),
          api.get('/api/inscriptions/')
        ]);
        setTournois(tournoisResponse.data);
        setInscriptions(inscriptionsResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [user, navigate, token]);

  const handleValiderInscription = async (inscriptionId: number) => {
    try {
      await api.patch(`/api/inscriptions/${inscriptionId}/`, { statut: 'validee' });
      setInscriptions(prev => prev.map(inscription => 
        inscription.id === inscriptionId 
          ? { ...inscription, statut: 'validee' }
          : inscription
      ));
      toast.success("Inscription validée avec succès");
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      toast.error("Erreur lors de la validation de l'inscription");
    }
  };

  const handleRefuserInscription = async (inscriptionId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser et supprimer cette inscription ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      await api.delete(`/api/inscriptions/${inscriptionId}/`);
      setInscriptions(prev => prev.filter(inscription => inscription.id !== inscriptionId));
      toast.success("Inscription refusée et supprimée");
    } catch (error) {
      console.error("Erreur lors du refus:", error);
      toast.error("Erreur lors du refus de l'inscription");
    }
  };

  if (!user || user.role !== 'organisateur') {
    return null; 
  }

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4">Chargement de vos données...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const inscriptionsEnAttente = inscriptions.filter(inscription => inscription.statut === 'en_attente');

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tableau de bord organisateur</h1>
          <Button onClick={() => navigate('/organisateur/tournois/nouveau')}>
            Créer un Tournoi
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inscriptions en attente ({inscriptionsEnAttente.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {inscriptionsEnAttente.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tournoi</TableHead>
                      <TableHead>Joueur</TableHead>
                      <TableHead>Jeu</TableHead>
                      <TableHead>Pseudo</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscriptionsEnAttente.map((inscription) => (
                      <TableRow key={inscription.id}>
                        <TableCell>{inscription.tournoi.nom}</TableCell>
                        <TableCell>
                          {inscription.joueur.utilisateur.first_name} {inscription.joueur.utilisateur.last_name}
                          <br />
                          <span className="text-sm text-gray-500">{inscription.joueur.utilisateur.email}</span>
                        </TableCell>
                        <TableCell>{inscription.jeu}</TableCell>
                        <TableCell>{inscription.pseudo}</TableCell>
                        <TableCell>{inscription.niveau}</TableCell>
                        <TableCell>
                          {new Date(inscription.date_inscription).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleValiderInscription(inscription.id)}
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                            >
                              Valider
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefuserInscription(inscription.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700"
                            >
                              Refuser
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Aucune inscription en attente
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mes Tournois ({tournois.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tournois.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Date de début</TableHead>
                      <TableHead>Date de fin</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournois.map((tournoi) => (
                      <TableRow key={tournoi.id}>
                        <TableCell>{tournoi.nom}</TableCell>
                        <TableCell>{new Date(tournoi.date_debut).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(tournoi.date_fin).toLocaleDateString()}</TableCell>
                        <TableCell>{tournoi.statut}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(`/organisateur/tournois/modifier/${tournoi.id}`)}>
                            Modifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Vous n'avez pas encore créé de tournoi
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrganisateurDashboard;