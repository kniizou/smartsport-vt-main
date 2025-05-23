
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Mail, Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      setIsLoading(true);
      // Inscription avec Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        }
      });
      if (error) {
        console.error("Erreur d'inscription:", error);
        setErrorMessage(error.message);
        if (error.message.includes("duplicate")) {
          toast.error("Un utilisateur avec cet email existe déjà");
        } else {
          toast.error("Erreur lors de l'inscription: " + error.message);
        }
        return;
      }
      toast.success("Inscription réussie! Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (error: any) {
      console.error("Erreur:", error);
      if (error.customMessage) {
        setErrorMessage(error.customMessage);
        toast.error(error.customMessage);
      } else {
        setErrorMessage("Une erreur inattendue s'est produite");
        toast.error("Une erreur inattendue s'est produite");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Conditions de sécurité du mot de passe
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== "";

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
              <h1 className="text-3xl font-bold">Créer un compte</h1>
              <p className="mt-3 text-muted-foreground">
                Rejoignez la communauté SmartSport et participez à des tournois passionnants.
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
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Votre pseudo" 
                      className="pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Mot de passe</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className={`pl-10 ${!passwordsMatch && confirmPassword !== "" ? "border-red-500" : ""}`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  {!passwordsMatch && confirmPassword !== "" && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                {/* Password requirements */}
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Le mot de passe doit :</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${hasMinLength ? "text-green-500" : "text-muted-foreground"}`}>
                      {hasMinLength ? <Check className="h-3 w-3 mr-2" /> : <span className="w-3 h-3 mr-2" />}
                      Contenir au moins 8 caractères
                    </li>
                    <li className={`flex items-center ${hasUppercase ? "text-green-500" : "text-muted-foreground"}`}>
                      {hasUppercase ? <Check className="h-3 w-3 mr-2" /> : <span className="w-3 h-3 mr-2" />}
                      Contenir au moins une majuscule
                    </li>
                    <li className={`flex items-center ${hasLowercase ? "text-green-500" : "text-muted-foreground"}`}>
                      {hasLowercase ? <Check className="h-3 w-3 mr-2" /> : <span className="w-3 h-3 mr-2" />}
                      Contenir au moins une minuscule
                    </li>
                    <li className={`flex items-center ${hasNumber ? "text-green-500" : "text-muted-foreground"}`}>
                      {hasNumber ? <Check className="h-3 w-3 mr-2" /> : <span className="w-3 h-3 mr-2" />}
                      Contenir au moins un chiffre
                    </li>
                  </ul>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full esports-gradient h-12 font-medium shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                disabled={!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !passwordsMatch || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription...
                  </span>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    S'inscrire
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Vous avez déjà un compte?{" "}
                <Link to="/login" className="text-accent hover:underline font-medium">
                  Connectez-vous
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
                    Prêt à entrer dans l'arène?
                  </span>
                </h2>
                
                <p className="text-lg">
                  Créez votre compte et commencez à participer à des tournois, suivre vos progrès et rejoindre une communauté de passionnés.
                </p>
              </div>

              <div className="relative h-64 w-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-esports-accent/20 to-esports-purple/20 rounded-xl border border-white/10"></div>
                <div className="absolute -bottom-6 -right-6 h-72 w-72 bg-gradient-to-br from-esports-purple to-esports-accent rounded-2xl -rotate-12 shadow-xl opacity-30"></div>
                <div className="absolute -top-6 -left-6 h-72 w-72 bg-esports-neon/30 rounded-2xl rotate-12 shadow-xl opacity-20"></div>
                <div className="absolute inset-4 backdrop-blur-sm rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl font-bold text-glow text-white">SmartSport</span>
                    <p className="text-white/70 mt-2">Dominez les classements</p>
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

export default Register;
