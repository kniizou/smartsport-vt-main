
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy } from "lucide-react";

// Mock data for tournaments
const tournaments = [
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
];

const statusColors = {
  live: "bg-destructive text-destructive-foreground",
  upcoming: "bg-accent text-accent-foreground",
  registration: "bg-primary text-primary-foreground",
  completed: "bg-muted text-muted-foreground"
};

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
          {tournament.status === 'live' ? 'En direct' : 
           tournament.status === 'upcoming' ? 'À venir' : 
           tournament.status === 'registration' ? 'Inscriptions ouvertes' : 'Terminé'}
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

const FeaturedTournaments = () => {
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Tournois à la une</h2>
            <p className="text-muted-foreground mt-1">Découvrez les tournois les plus populaires du moment</p>
          </div>
          <Link to="/tournaments">
            <Button variant="outline">
              Voir tous les tournois
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTournaments;
