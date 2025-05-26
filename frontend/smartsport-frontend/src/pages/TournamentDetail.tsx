import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { AxiosError } from 'axios'; // Importer AxiosError
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Trophy, Users, Clock, AlertCircle, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/use-toast"; // Correction: utiliser le bon import pour toast

// Interface pour les données de tournoi de l'API (détaillées)
interface ApiTournamentDetail {
  id: number;
  nom: string;
  description: string;
  type: string;
  regles: string; 
  date_debut: string;
  date_fin: string;
  prix_inscription: number;
  statut: string;
  organisateur: number; 
  // Champs qui pourraient être ajoutés par le backend ou simulés
  game?: string; // Sera basé sur 'type' ou un champ dédié si ajouté au backend
  location?: string; // Placeholder
  teamsCount?: number; // Placeholder, ex: 16
  registeredTeams?: number; // Placeholder, ex: 0. Devrait venir de l'API (nombre d'équipes inscrites)
  format?: string; // Placeholder
  image?: string; // Placeholder
  // Pour le planning et les équipes, il faudrait des appels API séparés ou les inclure dans la réponse principale
  schedule?: Array<{ id: number; stage: string; date: string; time: string; status: string }>; // Placeholder
  teams?: Array<{ id: number; name: string; logo?: string; status?: string }>; // Placeholder
  parsedRules?: string[]; // Pour les règles parsées
}

// Interface pour la structure attendue des erreurs de validation du backend (DRF)
interface ValidationErrors {
  [key: string]: string | string[];
  detail?: string;
}
type AxiosErrorWithCustomMessage = AxiosError<ValidationErrors> & { customMessage?: string };

const statusColors: { [key: string]: string } = {
  planifie: "bg-blue-500 text-white",
  en_cours: "bg-red-500 text-white",
  termine: "bg-gray-500 text-white",
  annule: "bg-yellow-500 text-black",
};

const statusLabels: { [key: string]: string } = {
  planifie: "Planifié / Inscriptions",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

const TournamentDetail = () => {
  const { id: tournamentId } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<ApiTournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) {
      toast({ title: "Erreur", description: "ID du tournoi non fourni.", variant: "destructive" });
      navigate("/tournaments");
      return;
    }
    setLoading(true);
    api.get<ApiTournamentDetail>(`/api/tournois/${tournamentId}/`)
      .then(response => {
        const parsedData = response.data; // Utiliser const
        try {
          if (typeof parsedData.regles === 'string' && parsedData.regles.startsWith('[')) {
            parsedData.parsedRules = JSON.parse(parsedData.regles);
          } else if (typeof parsedData.regles === 'string') {
            parsedData.parsedRules = parsedData.regles.split('\\n').filter(r => r.trim() !== ''); // Split par \n si c'est une chaîne simple
          } else {
            parsedData.parsedRules = [];
          }
        } catch (e) {
          console.warn("Impossible de parser les règles:", parsedData.regles, e);
          parsedData.parsedRules = typeof parsedData.regles === 'string' ? [parsedData.regles] : [];
        }
        
        // Simuler/assigner des données manquantes pour l'affichage
        parsedData.game = parsedData.game || parsedData.type;
        parsedData.location = parsedData.location || "En ligne";
        parsedData.teamsCount = parsedData.teamsCount || 16; // Placeholder
        parsedData.registeredTeams = parsedData.registeredTeams || 0; // Placeholder
        parsedData.format = parsedData.format || "Format non spécifié";
        parsedData.image = parsedData.image || "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80";
        parsedData.schedule = parsedData.schedule || []; 
        parsedData.teams = parsedData.teams || []; 

        setTournament(parsedData);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération du tournoi:", error);
        toast({ title: "Erreur", description: "Impossible de charger les détails du tournoi.", variant: "destructive" });
        navigate("/tournaments");
      })
      .finally(() => setLoading(false));
  }, [tournamentId, navigate]);

  const handleRegister = async () => {
    if (!isAuthenticated || !user) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour vous inscrire.", variant: "default" });
      navigate('/login');
      return;
    }
    if (!tournament) return;

    // TODO: Remplacer ceci par une vraie sélection d'équipe (ex: modal avec les équipes du joueur)
    const equipeIdInput = prompt("Entrez l'ID de votre équipe pour l'inscription (simulation):");
    if (!equipeIdInput || isNaN(parseInt(equipeIdInput))) {
        toast({title: "ID d'équipe invalide", description: "Veuillez entrer un ID d'équipe numérique.", variant: "destructive"});
        return;
    }
    const equipeId = parseInt(equipeIdInput);

    try {
      await api.post(`/api/tournois/${tournament.id}/inscrire_equipe/`, { equipe_id: equipeId });
      toast({ title: "Inscription réussie!", description: `Votre équipe (ID: ${equipeId}) a été inscrite au tournoi ${tournament.nom}.` });
      // Optionnel: Mettre à jour le nombre d'équipes inscrites si l'API le renvoie ou re-fetcher.
      if (tournament) {
        setTournament({...tournament, registeredTeams: (tournament.registeredTeams || 0) + 1});
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      let errorMsg = "Une erreur est survenue lors de l'inscription.";
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosErrorWithCustomMessage;
        const errorData = axiosError.response?.data;
        if (errorData) {
          if (typeof errorData.detail === 'string') { // DRF "detail" error is usually a string
            errorMsg = errorData.detail;
          } else {
            // Handle other field-specific errors which might be arrays
            const fieldErrorMessages: string[] = [];
            for (const key in errorData) {
              if (key !== 'detail' && Object.prototype.hasOwnProperty.call(errorData, key)) {
                const messages = errorData[key];
                if (Array.isArray(messages)) {
                  fieldErrorMessages.push(...messages);
                } else if (typeof messages === 'string') {
                  fieldErrorMessages.push(messages);
                }
              }
            }
            if (fieldErrorMessages.length > 0) {
              errorMsg = fieldErrorMessages.join(' ');
            } else if (axiosError.customMessage) { // Check for custom message from interceptor
              errorMsg = axiosError.customMessage;
            } else { // Fallback to generic Axios error message or default
              errorMsg = axiosError.message || errorMsg;
            }
          }
        } else { // No response.data
          errorMsg = axiosError.customMessage || axiosError.message || errorMsg;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast({ title: "Échec de l'inscription", description: errorMsg, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-16 flex-grow flex items-center justify-center">
          {/* Skeleton loader */}
          <div className="animate-pulse space-y-8 w-full max-w-4xl">
            <div className="h-8 bg-secondary/50 rounded w-3/4"></div>
            <div className="h-72 bg-secondary/50 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-secondary/50 rounded w-full"></div>
              <div className="h-4 bg-secondary/50 rounded w-5/6"></div>
              <div className="h-4 bg-secondary/50 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    // Ce cas est géré par le catch dans useEffect qui navigue ailleurs, mais sécurité supplémentaire.
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="container mx-auto px-6 py-16 flex-grow flex items-center justify-center">
                <p>Tournoi non trouvé.</p>
            </div>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <div className="relative">
          <div className="h-64 md:h-80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent z-10"></div>
            <img 
              src={tournament.image} 
              alt={tournament.nom}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="container px-6 mx-auto relative -mt-32 z-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <Link to="/tournaments" className="inline-flex items-center text-sm text-accent hover:underline mb-4">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Retour aux tournois
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{tournament.nom}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge 
                    className={`${statusColors[tournament.statut] || statusColors.planifie}`}
                  >
                    {statusLabels[tournament.statut] || tournament.statut}
                  </Badge>
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-md">
                    {tournament.game}
                  </Badge>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                {tournament.statut === 'planifie' && ( // Inscription possible si 'planifie'
                  <Button size="lg" onClick={handleRegister}>
                    S'inscrire au tournoi
                  </Button>
                )}
                 {tournament.statut === 'en_cours' && (
                  <Button variant="secondary" size="lg" onClick={() => alert("Lien vers le direct à implémenter")}>
                    Regarder en direct
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container px-6 mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="schedule">Planning</TabsTrigger>
                  <TabsTrigger value="teams">Équipes</TabsTrigger>
                  <TabsTrigger value="rules">Règles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-6">
                  <Card><CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">À propos du tournoi</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{tournament.description}</p>
                  </CardContent></Card>
                </TabsContent>
                
                <TabsContent value="schedule" className="space-y-6">
                  <Card><CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Planning des matchs (Placeholder)</h3>
                    {tournament.schedule && tournament.schedule.length > 0 ? (
                      <div className="space-y-4">
                        {tournament.schedule.map((event) => (
                          <div key={event.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0">
                            <div>
                              <h4 className="font-medium">{event.stage}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-4 w-4 mr-2" />{new Date(event.date).toLocaleDateString('fr-FR')}
                                <Clock className="h-4 w-4 ml-4 mr-2" />{event.time}
                              </div>
                            </div>
                            <Badge className={ event.status === 'completed' ? 'bg-muted text-muted-foreground' : event.status === 'live' ? 'bg-destructive text-destructive-foreground' : 'bg-accent text-accent-foreground'}>
                              {event.status === 'completed' ? 'Terminé' : event.status === 'live' ? 'En cours' : 'À venir'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : <p>Le planning sera bientôt disponible.</p>}
                  </CardContent></Card>
                </TabsContent>
                
                <TabsContent value="teams" className="space-y-6">
                  <Card><CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Équipes participantes (Placeholder)</h3>
                     {tournament.teams && tournament.teams.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {tournament.teams.map((team) => (
                            <div key={team.id} className="flex flex-col items-center justify-center p-4 border border-border/50 rounded-lg">
                                <img src={team.logo || `https://placehold.co/100/cccccc/ffffff?text=${team.name.substring(0,1)}`} alt={team.name} className="w-12 h-12 mb-2 rounded-full object-cover" />
                                <h4 className="font-medium text-center text-sm">{team.name}</h4>
                            </div>
                            ))}
                        </div>
                    ) : <p>Les équipes inscrites apparaîtront ici.</p>}
                  </CardContent></Card>
                </TabsContent>
                
                <TabsContent value="rules" className="space-y-6">
                  <Card><CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Règlement du tournoi</h3>
                    {tournament.parsedRules && tournament.parsedRules.length > 0 ? (
                      <ul className="space-y-2">
                        {tournament.parsedRules.map((rule, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 text-accent h-6 w-6 mr-3 shrink-0">{index + 1}</span>
                            <span className="text-muted-foreground">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-muted-foreground">Le règlement spécifique sera bientôt disponible.</p>}
                    <div className="mt-6 p-4 border border-accent/30 rounded-lg bg-accent/5">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 text-accent mt-0.5" />
                        <p className="text-sm">Le non-respect de ces règles peut entraîner des sanctions. Contactez l'organisation pour toute clarification.</p>
                      </div>
                    </div>
                  </CardContent></Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div> {/* Sidebar */}
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Détails Clés</h3>
                  <div className="space-y-4">
                    <div className="flex items-start"><Calendar className="h-5 w-5 mr-3 text-accent shrink-0" /><div>
                        <p className="font-medium">Dates</p>
                        <p className="text-sm text-muted-foreground">Du {new Date(tournament.date_debut).toLocaleDateString('fr-FR')} au {new Date(tournament.date_fin).toLocaleDateString('fr-FR')}</p>
                    </div></div>
                    <div className="flex items-start"><MapPin className="h-5 w-5 mr-3 text-accent shrink-0" /><div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-sm text-muted-foreground">{tournament.location}</p>
                    </div></div>
                    <div className="flex items-start"><Trophy className="h-5 w-5 mr-3 text-accent shrink-0" /><div>
                        <p className="font-medium">Prix</p>
                        <p className="text-sm text-muted-foreground">{tournament.prix_inscription}€</p>
                    </div></div>
                    <div className="flex items-start"><Users className="h-5 w-5 mr-3 text-accent shrink-0" /><div>
                        <p className="font-medium">Équipes</p>
                        <p className="text-sm text-muted-foreground">{tournament.registeredTeams}/{tournament.teamsCount} équipes</p>
                    </div></div>
                    <Separator />
                    <div>
                      <p className="font-medium">Format</p>
                      <p className="text-sm text-muted-foreground">{tournament.format}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/50">
                  {tournament.statut === 'planifie' ? (
                    <Button className="w-full" onClick={handleRegister}>S'inscrire au tournoi</Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>Inscriptions fermées</Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TournamentDetail;
