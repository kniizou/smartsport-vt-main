import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, User, Gamepad, Trophy, LogOut, UserCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toggleMenu();
    navigate('/');
  };
  
  const isActive = (path: string) => location.pathname === path;

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl bg-background/80">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <div className="w-10 h-10 rounded-xl esports-gradient shadow-lg shadow-esports-purple/20 flex items-center justify-center">
              <span className="font-bold text-white">SS</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">
              SmartSport
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg ${isActive('/') 
                ? 'text-accent bg-accent/10' 
                : 'text-foreground/80 hover:text-accent hover:bg-accent/5'} transition-colors`}
            >
              Accueil
            </Link>
            <Link 
              to="/tournaments" 
              className={`px-3 py-2 rounded-lg ${isActive('/tournaments') 
                ? 'text-accent bg-accent/10' 
                : 'text-foreground/80 hover:text-accent hover:bg-accent/5'} transition-colors`}
            >
              Tournois
            </Link>
            <Link 
              to="/games" 
              className={`px-3 py-2 rounded-lg ${isActive('/games') 
                ? 'text-accent bg-accent/10' 
                : 'text-foreground/80 hover:text-accent hover:bg-accent/5'} transition-colors flex items-center`}
            >
              <Gamepad className="mr-1 h-4 w-4" /> Jeux
            </Link>
            <Link 
              to="/ranking" 
              className={`px-3 py-2 rounded-lg ${isActive('/ranking') 
                ? 'text-accent bg-accent/10' 
                : 'text-foreground/80 hover:text-accent hover:bg-accent/5'} transition-colors flex items-center`}
            >
              <Trophy className="mr-1 h-4 w-4" /> Classement
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'administrateur' ? (
                <Link to="/admin/dashboard">
                  <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin ({user?.first_name || user?.email})
                  </Button>
                </Link>
              ) : (
                <Link to="/profile">
                  <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent">
                    <UserCircle className="mr-2 h-4 w-4" /> Profil ({user?.first_name || user?.email})
                  </Button>
                </Link>
              )}
              <Button onClick={handleLogout} className="esports-gradient shadow-lg shadow-esports-purple/20">
                <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent">
                  <LogIn className="mr-2 h-4 w-4" /> Se connecter
                </Button>
              </Link>
              <Link to="/register">
                <Button className="esports-gradient shadow-lg shadow-esports-purple/20">
                  <User className="mr-2 h-4 w-4" /> S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center space-x-3">
          <Button variant="outline" size="icon" className="rounded-lg border-border/50" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-background/95 backdrop-blur-md border-b border-border z-50 animate-fade-in">
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-5">
            <Link
              to="/"
              className={`px-4 py-2.5 rounded-lg ${isActive('/') ? 'bg-accent/10 text-accent' : 'hover:bg-secondary/50'} transition-colors flex items-center`}
              onClick={toggleMenu}
            >
              Accueil
            </Link>
            <Link
              to="/tournaments"
              className={`px-4 py-2.5 rounded-lg ${isActive('/tournaments') ? 'bg-accent/10 text-accent' : 'hover:bg-secondary/50'} transition-colors flex items-center`}
              onClick={toggleMenu}
            >
              Tournois
            </Link>
            <Link
              to="/games"
              className={`px-4 py-2.5 rounded-lg ${isActive('/games') ? 'bg-accent/10 text-accent' : 'hover:bg-secondary/50'} transition-colors flex items-center`}
              onClick={toggleMenu}
            >
              <Gamepad className="mr-2 h-4 w-4" /> Jeux
            </Link>
            <Link
              to="/ranking"
              className={`px-4 py-2.5 rounded-lg ${isActive('/ranking') ? 'bg-accent/10 text-accent' : 'hover:bg-secondary/50'} transition-colors flex items-center`}
              onClick={toggleMenu}
            >
              <Trophy className="mr-2 h-4 w-4" /> Classement
            </Link>
            <div className="flex flex-col space-y-3 pt-3 border-t border-border">
              {isAuthenticated ? (
                <>
                  {user?.role === 'administrateur' ? (
                    <Link to="/admin/dashboard" onClick={toggleMenu}>
                      <Button variant="outline" className="justify-start border-red-500/80 text-red-500 hover:bg-red-500/10 w-full">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/profile" onClick={toggleMenu}>
                      <Button variant="outline" className="justify-start border-accent text-accent hover:bg-accent/10 w-full">
                        <UserCircle className="mr-2 h-4 w-4" /> Profil ({user?.first_name || user?.email})
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleLogout} className="justify-start esports-gradient w-full">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={toggleMenu}>
                    <Button variant="outline" className="justify-start border-accent text-accent hover:bg-accent/10 w-full">
                      <LogIn className="mr-2 h-4 w-4" /> Se connecter
                    </Button>
                  </Link>
                  <Link to="/register" onClick={toggleMenu}>
                    <Button className="justify-start esports-gradient w-full">
                      <User className="mr-2 h-4 w-4" /> S'inscrire
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
