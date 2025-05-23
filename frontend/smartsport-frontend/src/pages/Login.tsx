import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Eye, EyeOff, Lock } from "lucide-react";
import { auth } from "@/lib/api";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    if (auth.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      setIsLoading(true);
      // Connexion avec notre API Django
      const data = await auth.login(email, password);
      toast.success("Connexion réussie!");
      navigate("/"); // Redirection vers la page d'accueil
    } catch (error: any) {
      console.error("Erreur:", error);
      if (error.customMessage) {
        setErrorMessage(error.customMessage);
        toast.error(error.customMessage);
      } else if (error.response?.status === 401) {
        setErrorMessage("Email ou mot de passe incorrect");
        toast.error("Email ou mot de passe incorrect");
      } else {
        setErrorMessage("Une erreur inattendue s'est produite");
        toast.error("Une erreur inattendue s'est produite");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-esports-blue to-esports-darkpurple">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4">
          <div className="h-72 w-72 rounded-full bg-esports-purple/20 blur-[100px]"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4">
          <div className="h-72 w-72 rounded-full bg-esports-neon/10 blur-[100px]"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 relative z-10">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Link to="/" className="inline-flex items-center justify-center mb-8">
                <div className="w-12 h-12 rounded-xl esports-gradient shadow-lg shadow-esports-purple/20 flex items-center justify-center">
                  <span className="font-bold text-white text-xl">SS</span>
                </div>
              </Link>
              <h1 className="text-3xl font-bold">Connexion</h1>
              <p className="mt-3 text-muted-foreground">
                Heureux de vous revoir! Connectez-vous pour accéder à votre compte.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {errorMessage && (
                <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="votre@email.com" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full esports-gradient h-12 font-medium shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Vous n'avez pas de compte?{" "}
                <Link to="/register" className="text-accent hover:underline font-medium">
                  Inscrivez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Image/Branding */}
        <div className="hidden md:flex md:w-1/2 bg-card/10 backdrop-blur-sm">
          <div className="w-full flex items-center justify-center p-12">
            <div className="max-w-lg space-y-8">
              <div className="space-y-4 text-center">
                <h2 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-esports-purple to-esports-neon bg-clip-text text-transparent">
                    Rejoignez la communauté
                  </span>
                </h2>
                
                <p className="text-lg">
                  Accédez à votre espace personnel pour participer à des tournois, suivre vos statistiques et bien plus encore.
                </p>
              </div>

              <div className="relative h-64 w-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-esports-accent/20 to-esports-purple/20 rounded-xl border border-white/10"></div>
                <div className="absolute -bottom-6 -right-6 h-72 w-72 bg-gradient-to-br from-esports-purple to-esports-accent rounded-2xl -rotate-12 shadow-xl opacity-30"></div>
                <div className="absolute -top-6 -left-6 h-72 w-72 bg-esports-neon/30 rounded-2xl rotate-12 shadow-xl opacity-20"></div>
                <div className="absolute inset-4 backdrop-blur-sm rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl font-bold text-glow text-white">SmartSport</span>
                    <p className="text-white/70 mt-2">La plateforme des passionnés d'e-sport</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
