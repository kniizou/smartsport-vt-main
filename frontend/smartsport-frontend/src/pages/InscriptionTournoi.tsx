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
import { Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';

interface Tournament {
  id: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  format: string;
  location?: string;
  registeredTeams?: number;
  teamsCount?: number;
}

interface ApiErrorResponse {
  detail: string;
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

const NIVEAUX = [
  { id: 'debutant', nom: 'Débutant' },
  { id: 'intermediaire', nom: 'Intermédiaire' },
  { id: 'avance', nom: 'Avancé' },
  { id: 'expert', nom: 'Expert' },
];

const InscriptionTournoi = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const now = new Date();
        const filteredTournaments = response.data.filter((tournament: Tournament) => {
          const startDate = new Date(tournament.date_debut);
          return startDate > now && 
                 tournament.statut === 'planifie' && 
                 (!tournament.teamsCount || !tournament.registeredTeams || 
                  tournament.registeredTeams < tournament.teamsCount);
        });
        setTournaments(filteredTournaments);
        if (filteredTournaments.length === 0) {
          toast.info('Aucun tournoi disponible pour le moment.');
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

    setIsSubmitting(true);

    try {
      const response = await tournamentsApi.register(selectedTournament.toString(), {
        jeu: selectedGame,
        pseudo: formData.pseudo,
        niveau: formData.niveau,
        experience: formData.experience,
        equipe: formData.equipe,
        commentaire: formData.commentaire
      });

      toast.success('Inscription au tournoi réussie !');
      // Rediriger vers la page de profil après un court délai
      setTimeout(() => {
      navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.detail || 'Erreur lors de l\'inscription au tournoi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Inscription à un tournoi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Sélectionnez un tournoi</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTournament === tournament.id
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'hover:border-primary/50 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedTournament(tournament.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{tournament.nom}</h3>
                          {selectedTournament === tournament.id && (
                            <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                              Sélectionné
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{tournament.description}</p>
                        <div className="space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(tournament.date_debut).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{tournament.location || 'En ligne'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {tournament.teamsCount && tournament.registeredTeams !== undefined
                                ? `${tournament.registeredTeams}/${tournament.teamsCount} équipes`
                                : 'Nombre d\'équipes non limité'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            <span>{tournament.format}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {tournaments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Aucun tournoi disponible pour le moment
                    </div>
                  )}
                </div>

                {selectedTournament && (
                  <>
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
                          {NIVEAUX.map((niveau) => (
                            <SelectItem key={niveau.id} value={niveau.id}>
                              {niveau.nom}
                            </SelectItem>
                          ))}
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
                        className="min-h-[100px]"
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
                        className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                        disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                      <Button 
                        type="submit" 
                        className="esports-gradient"
                        disabled={isSubmitting || !selectedGame || !formData.pseudo || !formData.niveau || !formData.experience}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inscription en cours...
                          </>
                        ) : (
                          "S'inscrire"
                        )}
                  </Button>
                </div>
                  </>
                )}
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