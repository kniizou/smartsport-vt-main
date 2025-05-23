
import { BadgeCheck, Eye, Clock, Trophy, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Tournois professionnels",
    description: "Créez et gérez des tournois avec un système professionnel de brackets et de suivi en temps réel.",
    icon: Trophy,
  },
  {
    title: "Suivi en temps réel",
    description: "Suivez les résultats et les classements de vos tournois favoris en temps réel.",
    icon: Eye,
  },
  {
    title: "Planification avancée",
    description: "Planifiez vos matchs et événements avec un calendrier intégré et des notifications.",
    icon: Clock,
  },
  {
    title: "Sécurité garantie",
    description: "Vos données et transactions sont sécurisées avec les dernières technologies de cryptage.",
    icon: ShieldCheck,
  }
];

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;
  
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="rounded-lg w-12 h-12 flex items-center justify-center mb-4 esports-gradient">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  );
};

const FeatureSection = () => {
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <BadgeCheck className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Créez vos tournois comme un pro</h2>
          <p className="text-lg text-muted-foreground">
            SmartSport vous offre tous les outils nécessaires pour créer, gérer et participer à des tournois e-sport de manière professionnelle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
