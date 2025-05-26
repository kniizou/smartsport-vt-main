import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Calendar, Users, Trophy, UserPlus, Building2, Gamepad2, Users2, Eye, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios, { AxiosError } from 'axios';
import { dashboard } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Interfaces pour typer les données reçues de l'API
interface UtilisateurData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_inscription: string;
}

interface InscriptionData {
  id: number;
  tournoi: number;
  joueur: number;
  jeu: string;
  pseudo: string;
  niveau: string;
  experience: string;
  equipe: number;
  commentaire: string;
  statut: string;
  date_inscription: string;
}

interface TournoiData {
  id: number;
  nom: string;
  description: string;
  type: string;
  regles: string;
  date_debut: string;
  date_fin: string;
  prix_inscription: string;
  statut: string;
  organisateur: number;
  inscriptions: InscriptionData[];
}

interface JoueurData {
  id: number;
  utilisateur: UtilisateurData;
  niveau: string;
  classement: number;
  inscriptions: InscriptionData[];
}

interface OrganisateurData {
  id: number;
  utilisateur: UtilisateurData;
  nom_organisation: string;
  description: string;
  tournois: TournoiData[];
}

interface DashboardStats {
  total_joueurs: number;
  total_organisateurs: number;
  total_tournois: number;
  total_equipes: number;
  tournois: TournoiData[];
  joueurs: JoueurData[];
  organisateurs: OrganisateurData[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tournois');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('=== Début fetchData ===');
      console.log('User:', user);
      console.log('Token:', localStorage.getItem('authToken'));
      
      if (!user) {
        console.log('Pas d\'utilisateur, redirection vers login');
        navigate('/login');
        return;
      }

      if (user.role !== 'administrateur') {
        console.log('Utilisateur non admin, redirection vers login');
        toast.error('Accès non autorisé. Rôle administrateur requis.');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Tentative de récupération des données du dashboard');
        const response = await dashboard.getAdminStats();
        console.log('Réponse du dashboard:', response.data);
        
        if (!response.data) {
          throw new Error('Aucune donnée reçue du dashboard');
        }

        setStats(response.data);
      } catch (error) {
        console.error('Erreur détaillée:', error);
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          console.log('Status de l\'erreur:', axiosError.response?.status);
          console.log('Données de l\'erreur:', axiosError.response?.data);
          
          if (axiosError.response?.status === 401) {
            console.log('Erreur 401 - Token invalide ou expiré');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            navigate('/login');
            toast.error('Session expirée. Veuillez vous reconnecter.');
          } else if (axiosError.response?.status === 403) {
            console.log('Erreur 403 - Accès non autorisé');
            toast.error('Accès non autorisé. Rôle administrateur requis.');
          } else if (axiosError.response?.status === 404) {
            console.log('Erreur 404 - Endpoint non trouvé');
            setError('L\'endpoint du dashboard n\'est pas trouvé. Veuillez vérifier la configuration.');
            toast.error('Erreur de configuration du dashboard');
          } else {
            console.log('Erreur autre:', axiosError.message);
            setError(`Erreur lors du chargement des données: ${axiosError.message}`);
            toast.error(`Erreur lors du chargement des données: ${axiosError.message}`);
          }
        } else {
          console.log('Erreur non-Axios:', error);
          setError('Une erreur inattendue est survenue');
          toast.error('Une erreur inattendue est survenue');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleToggleActive = async (userId: number, currentStatus: boolean, userType: 'joueur' | 'organisateur') => {
    try {
      await dashboard.updateUser(userId, { is_active: !currentStatus });
      
      setStats(prev => {
        if (!prev) return prev;
        if (userType === 'joueur') {
          return {
            ...prev,
            joueurs: prev.joueurs.map(j => 
              j.utilisateur.id === userId 
                ? { ...j, utilisateur: { ...j.utilisateur, is_active: !currentStatus } }
                : j
            )
          };
        } else {
          return {
            ...prev,
            organisateurs: prev.organisateurs.map(o => 
              o.utilisateur.id === userId 
                ? { ...o, utilisateur: { ...o.utilisateur, is_active: !currentStatus } }
                : o
            )
          };
        }
      });
      
      toast.success(`Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès.`);
    } catch (error) {
      toast.error("Erreur lors de la modification du statut de l'utilisateur.");
      console.error("Toggle active error:", error);
    }
  };

  const handleDeleteUser = async (userId: number, userType: 'joueur' | 'organisateur') => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        await dashboard.deleteUser(userId);
        
        setStats(prev => {
          if (!prev) return prev;
          if (userType === 'joueur') {
            return {
              ...prev,
              joueurs: prev.joueurs.filter(j => j.utilisateur.id !== userId)
            };
          } else {
            return {
              ...prev,
              organisateurs: prev.organisateurs.filter(o => o.utilisateur.id !== userId)
            };
          }
        });
        
        toast.success("Utilisateur supprimé avec succès.");
      } catch (error) {
        toast.error("Erreur lors de la suppression de l'utilisateur.");
        console.error("Delete user error:", error);
      }
    }
  };

  const handleDeleteTournoi = async (tournoiId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ? Cette action est irréversible.")) {
      try {
        await dashboard.deleteTournament(tournoiId);
        
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            tournois: prev.tournois.filter(t => t.id !== tournoiId)
          };
        });
        
        toast.success("Tournoi supprimé avec succès.");
      } catch (error) {
        toast.error("Erreur lors de la suppression du tournoi.");
        console.error("Delete tournament error:", error);
      }
    }
  };

  if (!user) {
    console.log('Rendu: Pas d\'utilisateur');
    return null;
  }

  if (user.role !== 'administrateur') {
    console.log('Rendu: Utilisateur non admin');
    return null;
  }

  if (isLoading) {
    console.log('Rendu: Chargement');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendu: Erreur');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    console.log('Rendu: Pas de stats');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur lors du chargement des données</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const filteredJoueurs = stats.joueurs.filter(joueur => 
    joueur.utilisateur.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    joueur.utilisateur.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    joueur.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganisateurs = stats.organisateurs.filter(organisateur =>
    organisateur.utilisateur.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organisateur.utilisateur.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organisateur.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organisateur.nom_organisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTournois = stats.tournois.filter(tournoi =>
    tournoi.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournoi.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold mb-10 text-center">Tableau de Bord Administrateur</h1>
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Joueurs</p>
                    <h2 className="text-3xl font-bold">{stats.total_joueurs}</h2>
                  </div>
                  <UserPlus className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Organisateurs</p>
                    <h2 className="text-3xl font-bold">{stats.total_organisateurs}</h2>
                  </div>
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tournois</p>
                    <h2 className="text-3xl font-bold">{stats.total_tournois}</h2>
                  </div>
                  <Gamepad2 className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Équipes</p>
                    <h2 className="text-3xl font-bold">{stats.total_equipes}</h2>
                  </div>
                  <Users2 className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                <TabsList className="grid w-[320px] grid-cols-3 rounded-lg bg-muted">
                  <TabsTrigger value="tournois">Tournois</TabsTrigger>
                  <TabsTrigger value="joueurs">Joueurs</TabsTrigger>
                  <TabsTrigger value="organisateurs">Organisateurs</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="tournois">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Tournois ({filteredTournois.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredTournois.map((tournoi) => (
                        <Card key={tournoi.id} className="border rounded-lg">
                          <CardHeader>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                              <div>
                                <CardTitle className="text-lg">{tournoi.nom}</CardTitle>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                                    <span>
                                      {new Date(tournoi.date_debut).toLocaleDateString('fr-FR')} - {new Date(tournoi.date_fin).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                  <Badge variant={tournoi.statut === 'planifie' ? 'secondary' : 'default'}>{tournoi.statut}</Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/tournois/${tournoi.id}`)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir détails
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteTournoi(tournoi.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              <p><span className="font-semibold">Description :</span> {tournoi.description}</p>
                              <p><span className="font-semibold">Type :</span> {tournoi.type}</p>
                              <p><span className="font-semibold">Prix d'inscription :</span> {tournoi.prix_inscription}€</p>
                              <p><span className="font-semibold">Inscriptions :</span> {tournoi.inscriptions?.length || 0} joueurs</p>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="joueurs">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Joueurs ({filteredJoueurs.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Inscriptions</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredJoueurs.map((joueur) => (
                            <TableRow key={joueur.id}>
                              <TableCell>{joueur.utilisateur.first_name} {joueur.utilisateur.last_name}</TableCell>
                              <TableCell>{joueur.utilisateur.email}</TableCell>
                              <TableCell>{joueur.niveau}</TableCell>
                              <TableCell>{joueur.inscriptions?.length || 0} tournois</TableCell>
                              <TableCell>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(joueur.utilisateur.id, 'joueur')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="organisateurs">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Organisateurs ({filteredOrganisateurs.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Organisation</TableHead>
                            <TableHead>Tournois</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrganisateurs.map((organisateur) => (
                            <TableRow key={organisateur.id}>
                              <TableCell>{organisateur.utilisateur.first_name} {organisateur.utilisateur.last_name}</TableCell>
                              <TableCell>{organisateur.utilisateur.email}</TableCell>
                              <TableCell>{organisateur.nom_organisation}</TableCell>
                              <TableCell>{organisateur.tournois?.length || 0} tournois</TableCell>
                              <TableCell>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(organisateur.utilisateur.id, 'organisateur')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;