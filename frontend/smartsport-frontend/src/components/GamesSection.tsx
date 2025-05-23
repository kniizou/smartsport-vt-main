
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const games = [
  {
    id: 1,
    name: "Valorant",
    image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    tournaments: 24,
    players: 1500,
  },
  {
    id: 2,
    name: "FIFA 24",
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    tournaments: 16,
    players: 950,
  },
  {
    id: 3,
    name: "League of Legends",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    tournaments: 31,
    players: 2200,
  },
  {
    id: 4,
    name: "Counter-Strike 2",
    image: "https://images.unsplash.com/photo-1579702455224-c0dd4067670f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    tournaments: 28,
    players: 1800,
  },
];

const GameCard = ({ game }) => {
  return (
    <Link to={`/games/${game.id}`} className="group">
      <div className="tournament-card h-full">
        <div className="relative h-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card z-10"></div>
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-xl mb-1 group-hover:text-accent transition-colors">
            {game.name}
          </h3>
          <div className="text-sm text-muted-foreground">
            <p>{game.tournaments} tournois</p>
            <p>{game.players} joueurs</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const GamesSection = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Jeux populaires</h2>
            <p className="text-muted-foreground mt-1">Explorez les jeux les plus populaires sur notre plateforme</p>
          </div>
          <Link to="/games">
            <Button variant="outline">
              Voir tous les jeux
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
