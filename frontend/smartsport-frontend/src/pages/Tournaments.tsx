import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Filter, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Interface pour les données de tournoi de l'API
interface ApiTournament {
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
  // Champs optionnels qui ne sont pas dans le modèle backend actuel mais étaient dans le mock
  game?: string; 
  teams?: number; 
  image?: string; // Pour l'image, nous utiliserons un placeholder pour l'instant
  // Ajout d'un champ pour le prix formaté si besoin, ou formater à l'affichage
  prize_formatted?: string;
}

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

// TODO: Rendre ces options dynamiques basées sur les jeux/types de tournois disponibles
const gamesOptions = ["Tous", "Valorant", "FIFA 24", "League of Legends", "Counter-Strike 2", "Rocket League", "Fortnite", "Apex Legends", "Overwatch 2"];
const statusOptions = ["Tous", ...Object.values(statusLabels)];

const TournamentCard = ({ tournament }: { tournament: ApiTournament }) => {
  const displayGame = tournament.game || tournament.type; // Utiliser le type si le jeu n'est pas là
  const displayTeams = tournament.teams || 'N/A'; // 'N/A' si non défini
  const displayPrize = tournament.prize_formatted || `${tournament.prix_inscription}€`;
  const displayStatus = tournament.statut;
  const displayImage = tournament.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"; // Placeholder

  return (
    <div className="tournament-card group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
        <img
          src={displayImage}
          alt={tournament.nom}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <Badge
          className={`absolute top-3 right-3 z-20 px-2 py-1 text-xs font-semibold ${statusColors[displayStatus] || statusColors.planifie}`}
        >
          {statusLabels[displayStatus] || displayStatus}
        </Badge>
        <div className="absolute bottom-3 left-3 z-20">
          <Badge variant="secondary" className="text-sm">
            {displayGame}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors truncate" title={tournament.nom}>
          {tournament.nom}
        </h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{new Date(tournament.date_debut).toLocaleDateString('fr-FR')} - {new Date(tournament.date_fin).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{displayTeams} équipes</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Trophy className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Prix: {displayPrize}</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <Link to={`/tournois/${tournament.id}`}>
          <Button variant="outline" className="w-full">
            Voir les détails
          </Button>
        </Link>
      </div>
    </div>
  );
};

const Tournaments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [allTournaments, setAllTournaments] = useState<ApiTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiTournament[]>('/tournois/');
        // Ajouter le champ prize_formatted pour l'affichage
        const tournamentsWithFormattedPrize = response.data.map(t => ({
          ...t,
          prize_formatted: `${t.prix_inscription}€`
        }));
        setAllTournaments(tournamentsWithFormattedPrize);
      } catch (error) {
        console.error("Erreur lors de la récupération des tournois:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = allTournaments.filter(tournament => {
    const matchesSearch = tournament.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tournament.game || tournament.type).toLowerCase().includes(searchQuery.toLowerCase());
    
    const gameToFilter = tournament.game || tournament.type; // Utiliser type si game n'existe pas
    const matchesGame = gameFilter === "Tous" || gameToFilter === gameFilter;
    
    const currentStatusLabel = statusLabels[tournament.statut] || tournament.statut;
    const matchesStatus = statusFilter === "Tous" || currentStatusLabel === statusFilter;
    
    return matchesSearch && matchesGame && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container px-6 mx-auto py-10 text-center">
          <p>Chargement des tournois...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="relative py-16 bg-secondary/20">
          {/* ... (Hero Section - gardé tel quel) ... */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
              <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-br from-esports-purple/20 to-esports-accent/20 blur-[100px] filter"></div>
            </div>
          </div>
          <div className="container relative z-10 px-6 mx-auto">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1.5 rounded-full border border-accent/50 bg-accent/5 text-accent text-sm font-medium mb-6 backdrop-blur-md">
                Trouvez votre prochain défi
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tous les <span className="bg-gradient-to-r from-esports-purple to-esports-accent bg-clip-text text-transparent">tournois</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Découvrez et participez à des tournois dans vos jeux préférés, suivez les compétitions en direct et montrez vos compétences.
              </p>
            </div>
          </div>
        </div>

        <div className="container px-6 mx-auto py-10">
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par nom, type..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-1 gap-4">
              <div className="w-full">
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par jeu/type" />
                  </SelectTrigger>
                  <SelectContent>
                    {gamesOptions.map((game) => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((statusVal) => (
                      <SelectItem key={statusVal} value={statusVal}>{statusVal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" className="md:w-auto" onClick={() => alert("Filtres avancés à implémenter")}>
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </div>

          {filteredTournaments.length > 0 ? (
            <div>
              <p className="text-muted-foreground mb-6">{filteredTournaments.length} tournois trouvés</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Aucun tournoi trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos filtres ou d'effectuer une autre recherche.</p>
              <Button variant="outline" className="mt-6" onClick={() => {
                setSearchQuery("");
                setGameFilter("Tous");
                setStatusFilter("Tous");
              }}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tournaments;
