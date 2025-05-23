
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-md border-t border-border mt-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-esports-purple rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-48 w-96 h-96 bg-esports-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-md esports-gradient flex items-center justify-center">
                <span className="font-bold text-white">SS</span>
              </div>
              <span className="font-bold text-xl">SmartSport</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme de gestion des tournois e-sport pour les joueurs passionnés.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center rounded-full border border-border bg-card/50 px-3 py-1 text-xs">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>Tous les systèmes opérationnels</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-medium mb-4 text-lg">Plateforme</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/" className="hover:text-accent transition-colors">Accueil</Link></li>
              <li><Link to="/tournaments" className="hover:text-accent transition-colors">Tournois</Link></li>
              <li><Link to="/games" className="hover:text-accent transition-colors">Jeux</Link></li>
              <li><Link to="/ranking" className="hover:text-accent transition-colors">Classement</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-medium mb-4 text-lg">Ressources</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-accent transition-colors">Support</Link></li>
              <li><Link to="/news" className="hover:text-accent transition-colors">Actualités</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-4">
            <h3 className="font-medium mb-4 text-lg">Rejoignez notre newsletter</h3>
            <p className="text-muted-foreground text-sm mb-4">Recevez les dernières nouvelles et mises à jour sur les tournois à venir.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="bg-secondary/50 rounded-lg px-4 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button className="bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/90 transition-colors">
                S'abonner
              </button>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-2">
              En vous inscrivant, vous acceptez notre politique de confidentialité.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
            © {new Date().getFullYear()} SmartSport. Tous droits réservés.
          </p>
          <div className="flex gap-6 mb-4 md:mb-0 order-1 md:order-2">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">Conditions d'utilisation</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
