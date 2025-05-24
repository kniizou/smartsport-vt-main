import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { tournaments as tournamentsApi } from '@/lib/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Tournament {
  id: number;
  nom: string;
  description: string;
  type: string;
  date_debut: string;
  date_fin: string;
  prix_inscription: number;
  statut: string;
  jeu: string;
}

const JEUX_DISPONIBLES = [
  { id: 'lol', nom: 'League of Legends' },
  { id: 'csgo', nom: 'Counter-Strike: Global Offensive' },
  { id: 'valorant', nom: 'Valorant' },
  { id: 'fifa', nom: 'FIFA 24' },
  { id: 'rocket_league', nom: 'Rocket League' },
  { id: 'fortnite', nom: 'Fortnite' },
  { id: 'apex', nom: 'Apex Legends' },
  { id: 'dota2', nom: 'Dota 2' },
];

const InscriptionTournoi = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [formData, setFormData] = useState({
    nom_tournoi: '',
    pseudo: '',
    niveau: '',
    experience: '',
    commentaire: '',
    equipe: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGame) {
      toast.error('Veuillez sélectionner un jeu');
      return;
    }

    if (!formData.nom_tournoi) {
      toast.error('Veuillez entrer le nom du tournoi');
      return;
    }

    try {
      await tournamentsApi.register({
        ...formData,
        jeu: selectedGame,
        statut: 'en_attente'
      });
      toast.success('Inscription au tournoi réussie !');
      navigate('/profile');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Erreur lors de l\'inscription au tournoi');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Inscription à un tournoi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="game">Sélectionnez un jeu</Label>
                <Select
                  value={selectedGame}
                  onValueChange={setSelectedGame}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un jeu" />
                  </SelectTrigger>
                  <SelectContent>
                    {JEUX_DISPONIBLES.map((jeu) => (
                      <SelectItem key={jeu.id} value={jeu.id}>
                        {jeu.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom_tournoi">Nom du tournoi</Label>
                <Input
                  id="nom_tournoi"
                  name="nom_tournoi"
                  value={formData.nom_tournoi}
                  onChange={handleChange}
                  required
                  placeholder="Entrez le nom du tournoi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pseudo">Pseudo de jeu</Label>
                <Input
                  id="pseudo"
                  name="pseudo"
                  value={formData.pseudo}
                  onChange={handleChange}
                  required
                  placeholder="Votre pseudo dans le jeu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niveau">Niveau de jeu</Label>
                <Select
                  value={formData.niveau}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debutant">Débutant</SelectItem>
                    <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                    <SelectItem value="avance">Avancé</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Décrivez votre expérience dans le jeu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipe">Nom de l'équipe</Label>
                <Input
                  id="equipe"
                  name="equipe"
                  value={formData.equipe}
                  onChange={handleChange}
                  placeholder="Nom de votre équipe (si vous en avez une)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentaire">Commentaire additionnel</Label>
                <Textarea
                  id="commentaire"
                  name="commentaire"
                  value={formData.commentaire}
                  onChange={handleChange}
                  placeholder="Informations supplémentaires que vous souhaitez partager"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  Annuler
                </Button>
                <Button type="submit" className="esports-gradient">
                  S'inscrire
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default InscriptionTournoi; 