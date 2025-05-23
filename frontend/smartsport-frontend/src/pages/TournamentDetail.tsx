
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Trophy, Users, Clock, AlertCircle, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";

// Modifié pour éviter la duplication de la propriété 'teams'
const tournamentData = {
  id: 1,
  title: "Valorant Champions Tour",
  game: "Valorant",
  status: "live",
  startDate: "2024-04-15",
  endDate: "2024-04-20",
  location: "En ligne / Finale à Paris",
  teamsCount: 16,
  registeredTeams: 16,
  prize: "10,000€",
  format: "Double élimination",
  description: "Le Valorant Champions Tour est la compétition officielle de Valorant réunissant les meilleures équipes de la région. Les équipes s'affronteront pour remporter leur part du prize pool de 10 000€ et se qualifier pour les finales internationales.",
  image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80",
  rules: [
    "Les équipes doivent être composées de 5 joueurs et jusqu'à 2 remplaçants",
    "Tous les participants doivent avoir plus de 16 ans",
    "Les joueurs doivent être classés Immortel ou plus",
    "Le planning des matchs sera communiqué 48h avant le début du tournoi",
    "Les décisions des arbitres sont définitives",
    "Tout comportement toxique sera sanctionné par une disqualification"
  ],
  schedule: [
    { id: 1, stage: "Qualifications", date: "2024-04-15", time: "14:00", status: "completed" },
    { id: 2, stage: "Huitièmes de finale", date: "2024-04-16", time: "16:00", status: "completed" },
    { id: 3, stage: "Quarts de finale", date: "2024-04-17", time: "18:00", status: "live" },
    { id: 4, stage: "Demi-finales", date: "2024-04-18", time: "18:00", status: "upcoming" },
    { id: 5, stage: "Finale", date: "2024-04-20", time: "20:00", status: "upcoming" }
  ],
  teams: [
    { id: 1, name: "Fnatic", logo: "https://placehold.co/100/667eea/ffffff?text=FNC", status: "qualified" },
    { id: 2, name: "Team Liquid", logo: "https://placehold.co/100/4c51bf/ffffff?text=TL", status: "qualified" },
    { id: 3, name: "G2 Esports", logo: "https://placehold.co/100/8b5cf6/ffffff?text=G2", status: "qualified" },
    { id: 4, name: "KOI", logo: "https://placehold.co/100/ec4899/ffffff?text=KOI", status: "qualified" },
    { id: 5, name: "Vitality", logo: "https://placehold.co/100/10b981/ffffff?text=VIT", status: "qualified" },
    { id: 6, name: "Karmine Corp", logo: "https://placehold.co/100/f97316/ffffff?text=KC", status: "qualified" },
    { id: 7, name: "NAVI", logo: "https://placehold.co/100/3b82f6/ffffff?text=NAVI", status: "qualified" },
    { id: 8, name: "BIG", logo: "https://placehold.co/100/ef4444/ffffff?text=BIG", status: "qualified" }
  ]
};

const statusColors = {
  live: "bg-destructive text-destructive-foreground",
  upcoming: "bg-accent text-accent-foreground",
  registration: "bg-primary text-primary-foreground",
  completed: "bg-muted text-muted-foreground"
};

const statusLabels = {
  live: "En direct",
  upcoming: "À venir",
  registration: "Inscriptions ouvertes",
  completed: "Terminé"
};

const TournamentDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(tournamentData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Simuler un chargement des données
  useEffect(() => {
    setLoading(true);
    // Dans un cas réel, on ferait un appel API ici
    setTimeout(() => {
      setTournament(tournamentData);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleRegister = () => {
    toast({
      title: "Inscription au tournoi",
      description: "Cette fonctionnalité sera bientôt disponible!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-16 flex-grow flex items-center justify-center">
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-64 md:h-80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent z-10"></div>
            <img 
              src={tournament.image} 
              alt={tournament.title}
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
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{tournament.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge 
                    className={`${statusColors[tournament.status]}`}
                  >
                    {statusLabels[tournament.status]}
                  </Badge>
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-md">
                    {tournament.game}
                  </Badge>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                {tournament.status === 'registration' ? (
                  <Button size="lg" onClick={handleRegister}>
                    S'inscrire au tournoi
                  </Button>
                ) : tournament.status === 'live' ? (
                  <Button variant="secondary" size="lg">
                    Regarder en direct
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container px-6 mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="schedule">Planning</TabsTrigger>
                  <TabsTrigger value="teams">Équipes</TabsTrigger>
                  <TabsTrigger value="rules">Règles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">À propos du tournoi</h3>
                      <p className="text-muted-foreground">{tournament.description}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="schedule" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Planning des matchs</h3>
                      <div className="space-y-4">
                        {tournament.schedule.map((event) => (
                          <div key={event.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0">
                            <div>
                              <h4 className="font-medium">{event.stage}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(event.date).toLocaleDateString('fr-FR')}
                                <Clock className="h-4 w-4 ml-4 mr-2" />
                                {event.time}
                              </div>
                            </div>
                            <Badge 
                              className={
                                event.status === 'completed' ? 'bg-muted text-muted-foreground' :
                                event.status === 'live' ? 'bg-destructive text-destructive-foreground' :
                                'bg-accent text-accent-foreground'
                              }
                            >
                              {event.status === 'completed' ? 'Terminé' :
                               event.status === 'live' ? 'En cours' :
                               'À venir'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="teams" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Équipes participantes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {tournament.teams.map((team) => (
                          <div key={team.id} className="flex flex-col items-center justify-center p-4 border border-border/50 rounded-lg">
                            <img src={team.logo} alt={team.name} className="w-12 h-12 mb-2" />
                            <h4 className="font-medium text-center">{team.name}</h4>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="rules" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Règlement du tournoi</h3>
                      <ul className="space-y-2">
                        {tournament.rules.map((rule, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 text-accent h-6 w-6 mr-3 shrink-0">{index + 1}</span>
                            <span className="text-muted-foreground">{rule}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 p-4 border border-accent/30 rounded-lg bg-accent/5">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 text-accent mt-0.5" />
                          <p className="text-sm">
                            Le non-respect de ces règles peut entraîner une disqualification immédiate. Pour toute question concernant le règlement, veuillez contacter l'équipe d'organisation via la page de support.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div>
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Détails du tournoi</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Dates</p>
                        <p className="text-sm text-muted-foreground">
                          Du {new Date(tournament.startDate).toLocaleDateString('fr-FR')} 
                          {' '}au {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-sm text-muted-foreground">{tournament.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Trophy className="h-5 w-5 mr-3 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Prix</p>
                        <p className="text-sm text-muted-foreground">{tournament.prize}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-3 text-accent shrink-0" />
                      <div>
                        <p className="font-medium">Équipes</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.registeredTeams}/{tournament.teamsCount} équipes inscrites
                        </p>
                      </div>
                    </div>

                    <Separator />
                    
                    <div>
                      <p className="font-medium">Format</p>
                      <p className="text-sm text-muted-foreground">{tournament.format}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/50">
                  {tournament.status === 'registration' ? (
                    <Button className="w-full" onClick={handleRegister}>S'inscrire au tournoi</Button>
                  ) : (
                    <Button variant="outline" className="w-full">Suivre ce tournoi</Button>
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
