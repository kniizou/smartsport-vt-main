import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api'; // Assurez-vous que ce chemin est correct
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Interfaces pour typer les données reçues de l'API
interface UtilisateurData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active?: boolean; // Ajouté pour correspondre à la logique d'activation/désactivation
}

interface JoueurData {
  id: number; // C'est l'ID du profil Joueur, qui est aussi l'ID de l'Utilisateur
  utilisateur: UtilisateurData;
  niveau: string;
  classement: number | null;
}

interface OrganisateurData {
  id: number; // C'est l'ID du profil Organisateur, qui est aussi l'ID de l'Utilisateur
  utilisateur: UtilisateurData;
  nom_organisation: string;
  description: string;
}


const AdminDashboard = () => {
  const { user, token } = useAuth(); // Assurez-vous que token est disponible via useAuth
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [joueurs, setJoueurs] = useState<JoueurData[]>([]);
  const [organisateurs, setOrganisateurs] = useState<OrganisateurData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'administrateur') {
      navigate('/login'); // Rediriger si pas admin
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // L'intercepteur api.ts s'occupe d'ajouter le token
        const [joueursRes, organisateursRes] = await Promise.all([
          api.get('/joueurs/'),
          api.get('/organisateurs/')
        ]);
        setJoueurs(joueursRes.data);
        setOrganisateurs(organisateursRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        toast.error("Erreur lors du chargement des données du dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [user, navigate, token]);


  if (!user || user.role !== 'administrateur') {
    return null; // Ou un composant de chargement/redirection
  }
  
  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Chargement des données...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredJoueurs = joueurs.filter(j =>
    (j.utilisateur.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (j.utilisateur.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    j.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.utilisateur.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganisateurs = organisateurs.filter(o =>
    (o.utilisateur.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.utilisateur.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    o.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.utilisateur.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.nom_organisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TODO: Implémenter les fonctions handleToggleActive et handleDeleteUser
  // Ces fonctions devraient appeler l'API pour activer/désactiver ou supprimer un utilisateur
  // et mettre à jour l'état local (joueurs/organisateurs).

  const handleToggleActive = async (userId: number, currentStatus: boolean | undefined, userType: 'joueur' | 'organisateur') => {
    // L'endpoint /api/utilisateurs/{id}/toggle_active/ existe déjà
    // L'intercepteur api.ts s'occupe d'ajouter le token
    try {
      const response = await api.post(`/utilisateurs/${userId}/toggle_active/`, {});
      toast.success(response.data.message);
      // Mettre à jour l'état local
      if (userType === 'joueur') {
        setJoueurs(prev => prev.map(j => j.utilisateur.id === userId ? { ...j, utilisateur: { ...j.utilisateur, is_active: response.data.is_active } } : j));
      } else {
        setOrganisateurs(prev => prev.map(o => o.utilisateur.id === userId ? { ...o, utilisateur: { ...o.utilisateur, is_active: response.data.is_active } } : o));
      }
    } catch (error) {
      toast.error("Erreur lors du changement de statut.");
      console.error("Toggle active error:", error);
    }
  };

  const handleDeleteUser = async (userId: number, userType: 'joueur' | 'organisateur') => {
    // L'endpoint DELETE /api/utilisateurs/{id}/ existe déjà
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      // L'intercepteur api.ts s'occupe d'ajouter le token
      try {
        await api.delete(`/utilisateurs/${userId}/`);
        toast.success("Utilisateur supprimé avec succès.");
        // Mettre à jour l'état local
        if (userType === 'joueur') {
          setJoueurs(prev => prev.filter(j => j.utilisateur.id !== userId));
        } else {
          setOrganisateurs(prev => prev.filter(o => o.utilisateur.id !== userId));
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression de l'utilisateur.");
        console.error("Delete user error:", error);
      }
    }
  };


  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de Bord Administrateur</h1>
        
        <Input
          type="text"
          placeholder="Rechercher des utilisateurs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mb-6"
        />
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Joueurs ({filteredJoueurs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJoueurs.map((joueur) => (
                    <TableRow key={joueur.id}>
                      <TableCell>{joueur.utilisateur.first_name} {joueur.utilisateur.last_name} ({joueur.utilisateur.username})</TableCell>
                      <TableCell>{joueur.utilisateur.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          joueur.utilisateur.is_active === undefined ? 'bg-gray-100 text-gray-800' : // Cas où is_active n'est pas défini
                          joueur.utilisateur.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {joueur.utilisateur.is_active === undefined ? 'Inconnu' : joueur.utilisateur.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(joueur.utilisateur.id, joueur.utilisateur.is_active, 'joueur')}
                        >
                          {joueur.utilisateur.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(joueur.utilisateur.id, 'joueur')}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organisateurs ({filteredOrganisateurs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganisateurs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.utilisateur.first_name} {org.utilisateur.last_name} ({org.utilisateur.username}) - {org.nom_organisation}</TableCell>
                      <TableCell>{org.utilisateur.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          org.utilisateur.is_active === undefined ? 'bg-gray-100 text-gray-800' :
                          org.utilisateur.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {org.utilisateur.is_active === undefined ? 'Inconnu' : org.utilisateur.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                         <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(org.utilisateur.id, org.utilisateur.is_active, 'organisateur')}
                        >
                          {org.utilisateur.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(org.utilisateur.id, 'organisateur')}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;