import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentative de connexion...');
      const response = await login(email, password);
      console.log('Réponse de connexion:', response);
      
      if (response.user && response.token) {
        console.log('Connexion réussie, rôle:', response.user.role);
        contextLogin(response.user, response.token);
        toast.success('Connexion réussie!');
        
        if (response.user.role === 'administrateur') {
          console.log('Redirection vers le dashboard admin');
          navigate('/admin/dashboard');
        } else {
          console.log('Redirection vers la page d\'accueil');
          navigate('/');
        }
      } else {
        console.error('Réponse de connexion invalide:', response);
        toast.error('Erreur lors de la connexion: réponse invalide');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 