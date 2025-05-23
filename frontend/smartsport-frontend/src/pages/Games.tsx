
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const games = [
  {
    id: 1,
    name: "Valorant",
    image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    description: "Un FPS tactique 5v5 où la précision et le travail d'équipe sont essentiels pour remporter la victoire.",
    tournaments: 24,
    players: 1500,
    categories: ["FPS", "Tactique", "Compétitif"]
  },
  {
    id: 2,
    name: "FIFA 24",
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    description: "Le jeu de football ultime avec des graphismes et une jouabilité améliorés pour une expérience authentique.",
    tournaments: 16,
    players: 950,
    categories: ["Sport", "Simulation", "Football"]
  },
  {
    id: 3,
    name: "League of Legends",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    description: "Un MOBA où deux équipes de cinq champions s'affrontent pour détruire la base adverse.",
    tournaments: 31,
    players: 2200,
    categories: ["MOBA", "Stratégie", "Équipe"]
  },
  {
    id: 4,
    name: "Counter-Strike 2",
    image: "https://images.unsplash.com/photo-1579702455224-c0dd4067670f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    description: "Le célèbre FPS tactique dans une version améliorée avec de nouvelles cartes et mécaniques.",
    tournaments: 28,
    players: 1800,
    categories: ["FPS", "Tactique", "Compétitif"]
  },
  {
    id: 5,
    name: "Rocket League",
    image: "https://images.unsplash.com/photo-1614465000772-1b9595c123b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    description: "Un jeu qui mélange le football et les courses de voitures pour une expérience unique et addictive.",
    tournaments: 14,
    players: 1100,
    categories: ["Sport", "Voitures", "Arcade"]
  },
  {
    id: 6,
    name: "Fortnite",
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    description: "Un Battle Royale aux graphismes colorés où construction et tir se combinent pour la victoire.",
    tournaments: 19,
    players: 1600,
    categories: ["Battle Royale", "TPS", "Construction"]
  }
];

const Games = () => {
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
                Explorez notre catalogue de jeux
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Découvrez les <span className="bg-gradient-to-r from-esports-purple to-esports-accent bg-clip-text text-transparent">meilleurs jeux</span> du moment
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Rejoignez des milliers de joueurs et participez à des tournois dans vos jeux préférés.
              </p>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="container px-6 mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div key={game.id} className="tournament-card relative group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90 z-10"></div>
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                    <h3 className="font-bold text-xl text-white group-hover:text-accent transition-colors">
                      {game.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {game.categories.map((category, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-accent" />
                      <span>{game.tournaments} tournois</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-accent" />
                      <span>{game.players} joueurs</span>
                    </div>
                  </div>
                  
                  <Link to={`/games/${game.id}`}>
                    <Button variant="outline" className="w-full group border-accent/50 hover:bg-accent/10 hover:text-accent">
                      <span>Voir les tournois</span>
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;
