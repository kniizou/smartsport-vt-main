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
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    pseudo: '',
    niveau: '',
    experience: '',
    commentaire: '',
    equipe: '',
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const response = await tournamentsApi.getAll();
        // Filtrer les tournois pour ne montrer que ceux à venir
        const futureTournaments = response.data.filter((tournament: Tournament) => {
          const startDate = new Date(tournament.date_debut);
          return startDate > new Date();
        });
        setTournaments(futureTournaments);
        if (futureTournaments.length === 0) {
          toast.info('Aucun tournoi à venir disponible pour le moment.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des tournois:', error);
        toast.error('Erreur lors de la récupération des tournois. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTournament) {
      toast.error('Veuillez sélectionner un tournoi');
      return;
    }

    if (!selectedGame) {
      toast.error('Veuillez sélectionner un jeu');
      return;
    }

    try {
      await tournamentsApi.register({
        tournoi_id: selectedTournament,
        ...formData,
        jeu: selectedGame,
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
            {isLoading ? (
              <div className="text-center py-4">
                <p>Chargement des tournois disponibles...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-4">
                <p>Aucun tournoi disponible pour le moment.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="mt-4"
                >
                  Retour au profil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tournament">Sélectionnez un tournoi</Label>
                  <Select
                    value={selectedTournament?.toString()}
                    onValueChange={(value) => setSelectedTournament(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un tournoi" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournaments.map((tournament) => (
                        <SelectItem key={tournament.id} value={tournament.id.toString()}>
                          {tournament.nom} - {new Date(tournament.date_debut).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default InscriptionTournoi; 