import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-md border-t border-border/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-esports-purple to-esports-accent bg-clip-text text-transparent">
                SmartSport
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              La plateforme de référence pour les tournois e-sport. Créez, gérez et participez à des compétitions dans vos jeux préférés.
            </p>
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
