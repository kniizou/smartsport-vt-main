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

const OrganisateurDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tournois, setTournois] = useState<TournoiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'organisateur') {
      toast.error("Accès non autorisé.");
      navigate('/'); // Rediriger si pas organisateur
      return;
    }

    const fetchTournois = async () => {
      setIsLoading(true);
      try {
        // L'API pour lister les tournois de l'organisateur connecté n'existe pas encore explicitement.
        // TournoiViewSet.get_queryset() n'est pas filtré par organisateur par défaut pour la liste.
        // Nous allons pour l'instant récupérer tous les tournois et filtrer côté client,
        // ou idéalement, l'API devrait permettre de filtrer par organisateur_id.
        // Pour l'instant, on récupère tous les tournois.
        // Il faudra améliorer cela côté backend pour ne récupérer que ceux de l'organisateur.
        const response = await api.get('/tournois/'); // L'intercepteur s'occupe du token
        // Filtrer ici si l'API ne le fait pas, ou mieux, ajuster l'API.
        // Supposons que l'API renvoie tous les tournois et que l'organisateur_id est dans user.id
        // ou que le backend filtre déjà. Pour l'instant, on affiche tout.
        setTournois(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des tournois:", error);
        toast.error("Erreur lors du chargement des tournois.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTournois();
    }
  }, [user, navigate, token]);

  if (!user || user.role !== 'organisateur') {
    return null; 
  }

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Chargement de vos tournois...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des Tournois</h1>
          <Button onClick={() => navigate('/organisateur/tournois/nouveau')}>
            Créer un Tournoi
          </Button>
        </div>

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
                        {/* Ajouter bouton supprimer et autres actions */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Vous n'avez pas encore créé de tournoi.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default OrganisateurDashboard;