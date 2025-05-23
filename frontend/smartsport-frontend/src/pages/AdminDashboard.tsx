import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  date_joined?: string;
  last_login?: string;
  is_active?: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joueurs, setJoueurs] = useState<UserData[]>([]);
  const [organisateurs, setOrganisateurs] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'administrateur') {
      toast.error("Accès non autorisé.");
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simuler des appels API (remplacez par vos vraies requêtes)
        const mockJoueurs: UserData[] = [
          { id: 1, username: 'joueur1', email: 'joueur1@example.com', role: 'joueur', date_joined: '2023-01-01', is_active: true },
          { id: 2, username: 'joueur2', email: 'joueur2@example.com', role: 'joueur', date_joined: '2023-01-02', is_active: true },
        ];
        
        const mockOrganisateurs: UserData[] = [
          { id: 3, username: 'org1', email: 'org1@example.com', role: 'organisateur', date_joined: '2023-01-03', is_active: true },
        ];

        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setJoueurs(mockJoueurs);
        setOrganisateurs(mockOrganisateurs);
        setError(null);
      } catch (err: unknown) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleError = (error: unknown) => {
    let message = "Erreur lors de la récupération des données.";
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    }
    setError(message);
    toast.error(message);
    console.error("AdminDashboard error:", error);
  };

  const filteredUsers = (users: UserData[]) => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      // Ici vous feriez normalement un appel API
      toast.success(`Action ${action} effectuée pour l'utilisateur ${userId}`);
    } catch (error) {
      handleError(error);
    }
  };

  if (!user || user.role !== 'administrateur') {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <Card>
            <CardHeader>
              <CardTitle>Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Tableau de Bord Administrateur</h1>
        
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Joueurs Inscrits ({filteredUsers(joueurs).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers(joueurs).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom d'utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers(joueurs).map((joueur) => (
                      <TableRow key={joueur.id}>
                        <TableCell>{joueur.id}</TableCell>
                        <TableCell>{joueur.username}</TableCell>
                        <TableCell>{joueur.email}</TableCell>
                        <TableCell>{joueur.date_joined ? new Date(joueur.date_joined).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            joueur.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {joueur.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUserAction(joueur.id, joueur.is_active ? 'deactivate' : 'activate')}
                          >
                            {joueur.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleUserAction(joueur.id, 'delete')}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucun joueur trouvé.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Organisateurs ({filteredUsers(organisateurs).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers(organisateurs).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom d'utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers(organisateurs).map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>{org.id}</TableCell>
                        <TableCell>{org.username}</TableCell>
                        <TableCell>{org.email}</TableCell>
                        <TableCell>{org.date_joined ? new Date(org.date_joined).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {org.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUserAction(org.id, org.is_active ? 'deactivate' : 'activate')}
                          >
                            {org.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleUserAction(org.id, 'delete')}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucun organisateur trouvé.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;