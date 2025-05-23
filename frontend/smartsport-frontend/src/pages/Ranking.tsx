
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Données de démonstration pour le classement
const rankingData = [
  {
    id: 1,
    name: "Team Liquid",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 1,
    points: 1250,
    wins: 42,
    losses: 12,
    trend: "up",
    games: ["Valorant", "League of Legends"]
  },
  {
    id: 2,
    name: "Cloud9",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 2,
    points: 1180,
    wins: 39,
    losses: 15,
    trend: "same",
    games: ["Counter-Strike 2", "Valorant"]
  },
  {
    id: 3,
    name: "G2 Esports",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 3,
    points: 1120,
    wins: 37,
    losses: 18,
    trend: "up",
    games: ["League of Legends", "Valorant"]
  },
  {
    id: 4,
    name: "Fnatic",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 4,
    points: 1090,
    wins: 36,
    losses: 20,
    trend: "down",
    games: ["Counter-Strike 2", "League of Legends"]
  },
  {
    id: 5,
    name: "NaVi",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 5,
    points: 1050,
    wins: 35,
    losses: 21,
    trend: "same",
    games: ["Counter-Strike 2"]
  },
  {
    id: 6,
    name: "100 Thieves",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 6,
    points: 980,
    wins: 32,
    losses: 23,
    trend: "up",
    games: ["Valorant", "Fortnite"]
  },
  {
    id: 7,
    name: "TSM",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 7,
    points: 950,
    wins: 31,
    losses: 24,
    trend: "down",
    games: ["League of Legends", "Fortnite"]
  },
  {
    id: 8,
    name: "FaZe Clan",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 8,
    points: 920,
    wins: 30,
    losses: 25,
    trend: "same",
    games: ["Counter-Strike 2", "Fortnite"]
  },
  {
    id: 9,
    name: "Team Vitality",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 9,
    points: 890,
    wins: 29,
    losses: 26,
    trend: "up",
    games: ["Counter-Strike 2", "League of Legends", "Rocket League"]
  },
  {
    id: 10,
    name: "Sentinels",
    logo: "https://images.unsplash.com/photo-1592853598064-9a7b18400312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    rank: 10,
    points: 860,
    wins: 28,
    losses: 27,
    trend: "down",
    games: ["Valorant"]
  }
];

const games = ["Tous les jeux", "Valorant", "Counter-Strike 2", "League of Legends", "Fortnite", "Rocket League"];

const Ranking = () => {
  const [selectedGame, setSelectedGame] = useState("Tous les jeux");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les équipes par jeu et recherche
  const filteredTeams = rankingData.filter(team => {
    const matchesGame = selectedGame === "Tous les jeux" || team.games.includes(selectedGame);
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGame && matchesSearch;
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
                <Trophy className="inline-block h-4 w-4 mr-2" />
                Classement mondial
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Les <span className="bg-gradient-to-r from-esports-purple to-esports-accent bg-clip-text text-transparent">meilleures équipes</span> du moment
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Consultez le classement des équipes e-sport les plus performantes selon leurs résultats en tournois.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="container px-6 mx-auto py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {games.map((game) => (
                <Button 
                  key={game}
                  variant={selectedGame === game ? "default" : "outline"}
                  className={selectedGame === game ? "esports-gradient" : ""}
                  onClick={() => setSelectedGame(game)}
                >
                  {game}
                </Button>
              ))}
            </div>
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Rechercher une équipe..." 
                  className="w-full md:w-64 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="rounded-lg overflow-hidden border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rang</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Équipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">V/D</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Jeux</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold">{team.rank}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary/50"></div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{team.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{team.points}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{team.wins}W / {team.losses}L</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.trend === "up" && (
                          <div className="flex items-center text-green-500">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            <span className="text-sm">En hausse</span>
                          </div>
                        )}
                        {team.trend === "down" && (
                          <div className="flex items-center text-red-500">
                            <ArrowDown className="h-4 w-4 mr-1" />
                            <span className="text-sm">En baisse</span>
                          </div>
                        )}
                        {team.trend === "same" && (
                          <div className="flex items-center text-muted-foreground">
                            <span className="text-sm">Stable</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {team.games.map((game, idx) => (
                            <span 
                              key={idx} 
                              className="inline-block px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent border border-accent/20"
                            >
                              {game}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Ranking;
