
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const JoinCTA = () => {
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        <div className="rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-esports-blue via-esports-darkpurple to-esports-purple opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Rejoignez la communauté <span className="text-accent text-glow">SmartSport</span>
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
              Rejoignez des milliers de joueurs et organisateurs qui utilisent déjà SmartSport pour leurs tournois e-sport. Créez votre compte gratuit dès maintenant !
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-esports-blue hover:text-esports-darkpurple">
                Créer un compte
              </Button>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="border-white/50 hover:border-white text-white hover:bg-white/10">
                  Explorer les tournois
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCTA;
