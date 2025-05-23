
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pb-32 sm:pt-32">
      {/* Background elements - modernized with gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
          <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-esports-purple/30 to-esports-accent/30 blur-[100px] filter"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 transform">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-esports-accent/20 to-esports-purple/20 blur-[120px] filter"></div>
        </div>
      </div>
      
      <div className="container relative z-10 px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-accent/50 bg-accent/5 text-accent text-sm font-medium backdrop-blur-md">
              La nouvelle génération de tournois e-sport
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Gérez vos <span className="bg-gradient-to-r from-esports-purple to-esports-accent bg-clip-text text-transparent">tournois e-sport</span> comme un pro
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Créez, gérez et participez à des tournois de Valorant, FIFA, League of Legends et plus encore. Suivez les classements et résultats en temps réel.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <Button size="lg" className="esports-gradient rounded-xl h-14 px-8 text-base font-medium shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] transition-shadow">
                Créer un tournoi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-accent border-2 hover:border-accent text-accent hover:bg-accent/10 rounded-xl h-14 px-8 text-base font-medium">
                Explorer les tournois
              </Button>
            </div>
            <div className="flex items-center space-x-4 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted border-2 border-background flex items-center justify-center text-xs animate-pulse-glow" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">2,000+</span> joueurs ont rejoint la plateforme
              </p>
            </div>
          </div>
          
          {/* Modern 3D-like card effect */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-[450px] h-[450px] perspective-1000">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-esports-purple/80 to-esports-accent/80 transform rotate-6 transition-all duration-500 shadow-[0_0_35px_rgba(139,92,246,0.4)]"></div>
              <div className="absolute inset-[3px] rounded-2xl bg-card transform rotate-3 transition-all duration-500"></div>
              <div className="absolute inset-[6px] rounded-xl overflow-hidden border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Tournament gameplay" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/70 backdrop-blur-md rounded-lg border border-white/10">
                <h3 className="text-xl font-bold text-accent">Valorant Masters</h3>
                <p className="text-sm text-white/80">16 équipes • Prix: 10,000€</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
