import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const mockJoueurs = [
  { id: 1, name: 'John Doe', email: 'john@example.com', isActive: true },
  { id: 2, name: 'Alice Smith', email: 'alice@example.com', isActive: true },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', isActive: false }
];

const mockOrganisateurs = [
  { id: 1, name: 'Jane Smith', email: 'jane@example.com', isActive: true },
  { id: 2, name: 'Mike Johnson', email: 'mike@example.com', isActive: true }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user || user.role !== 'administrateur') {
    return null;
  }

  const filteredJoueurs = mockJoueurs.filter(joueur => 
    joueur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    joueur.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganisateurs = mockOrganisateurs.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <TableCell>{joueur.name}</TableCell>
                      <TableCell>{joueur.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          joueur.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {joueur.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm">
                          {joueur.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button variant="destructive" size="sm">
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
                      <TableCell>{org.name}</TableCell>
                      <TableCell>{org.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          org.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {org.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm">
                          {org.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button variant="destructive" size="sm">
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