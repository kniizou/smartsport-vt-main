
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Filter, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Données mock pour les tournois
const tournamentsData = [
  {
    id: 1,
    title: "Valorant Champions Tour",
    game: "Valorant",
    status: "live",
    startDate: "2024-04-15",
    endDate: "2024-04-20",
    teams: 16,
    prize: "10,000€",
    image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
  },
  {
    id: 2,
    title: "FIFA Ultimate League",
    game: "FIFA 24",
    status: "upcoming",
    startDate: "2024-04-25",
    endDate: "2024-04-28",
    teams: 32,
    prize: "5,000€",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    title: "League Championship",
    game: "League of Legends",
    status: "upcoming",
    startDate: "2024-05-01",
    endDate: "2024-05-10",
    teams: 12,
    prize: "15,000€",
    image: "https://images.unsplash.com/photo-1511882150382-421056c89033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
  },
  {
    id: 4,
    title: "CS Masters",
    game: "Counter-Strike 2",
    status: "registration",
    startDate: "2024-05-15",
    endDate: "2024-05-18",
    teams: 24,
    prize: "8,000€",
    image: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1475&q=80"
  },
  {
    id: 5,
    title: "Rocket League Cup",
    game: "Rocket League",
    status: "registration",
    startDate: "2024-05-20",
    endDate: "2024-05-22",
    teams: 16,
    prize: "3,000€",
    image: "https://images.unsplash.com/photo-1614465000772-1b9595c123b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 6,
    title: "Fortnite Battle",
    game: "Fortnite",
    status: "upcoming",
    startDate: "2024-06-01",
    endDate: "2024-06-03",
    teams: 50,
    prize: "12,000€",
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
  },
  {
    id: 7,
    title: "Apex Legends Showdown",
    game: "Apex Legends",
    status: "upcoming",
    startDate: "2024-06-10",
    endDate: "2024-06-12",
    teams: 20,
    prize: "7,500€",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 8,
    title: "Overwatch Championship",
    game: "Overwatch 2",
    status: "registration",
    startDate: "2024-06-15",
    endDate: "2024-06-18",
    teams: 12,
    prize: "6,000€",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1265&q=80"
  }
];

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

const gamesOptions = ["Tous", "Valorant", "FIFA 24", "League of Legends", "Counter-Strike 2", "Rocket League", "Fortnite", "Apex Legends", "Overwatch 2"];
const statusOptions = ["Tous", "En direct", "À venir", "Inscriptions ouvertes", "Terminés"];

const TournamentCard = ({ tournament }) => {
  return (
    <div className="tournament-card group">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card z-10"></div>
        <img 
          src={tournament.image} 
          alt={tournament.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <Badge 
          className={`absolute top-2 right-2 z-20 ${statusColors[tournament.status]}`}
        >
          {statusLabels[tournament.status]}
        </Badge>
        <div className="absolute top-2 left-2 z-20">
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-none">
            {tournament.game}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
          {tournament.title}
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(tournament.startDate).toLocaleDateString('fr-FR')}</span>
            {tournament.endDate && (
              <> - <span>{new Date(tournament.endDate).toLocaleDateString('fr-FR')}</span></>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{tournament.teams} équipes</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 mr-2" />
            <span>Prix: {tournament.prize}</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <Link to={`/tournament/${tournament.id}`}>
          <Button variant="secondary" className="w-full">
            Voir le tournoi
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

  // Filtrer les tournois selon la recherche et les filtres
  const filteredTournaments = tournamentsData.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.game.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGame = gameFilter === "Tous" || tournament.game === gameFilter;
    
    const matchesStatus = statusFilter === "Tous" || 
                         (statusFilter === "En direct" && tournament.status === "live") ||
                         (statusFilter === "À venir" && tournament.status === "upcoming") ||
                         (statusFilter === "Inscriptions ouvertes" && tournament.status === "registration") ||
                         (statusFilter === "Terminés" && tournament.status === "completed");
    
    return matchesSearch && matchesGame && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative py-16 bg-secondary/20">
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

        {/* Filter Section */}
        <div className="container px-6 mx-auto py-10">
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher des tournois..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-1 gap-4">
              <div className="w-full">
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par jeu" />
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
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" className="md:w-auto">
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
              <p className="text-muted-foreground">Essayez de modifier vos filtres ou d'effectuer une autre recherche</p>
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
