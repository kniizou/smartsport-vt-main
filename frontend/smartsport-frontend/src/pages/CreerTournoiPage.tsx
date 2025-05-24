import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios'; // Importer AxiosError
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Correspond aux Tournoi.TYPE_CHOICES et Tournoi.STATUT_CHOICES du backend
const TYPE_CHOICES = [
  { value: 'elimination', label: 'Élimination simple' },
  { value: 'round-robin', label: 'Round Robin' },
  { value: 'mixte', label: 'Format mixte' },
];

// Le statut sera 'planifie' par défaut à la création

const CreerTournoiPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(TYPE_CHOICES[0].value);
  const [regles, setRegles] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [prixInscription, setPrixInscription] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user || user.role !== 'organisateur') {
      toast.error("Action non autorisée.");
      setIsLoading(false);
      navigate('/');
      return;
    }

    const tournoiData = {
      nom,
      description,
      type,
      regles,
      date_debut: dateDebut,
      date_fin: dateFin,
      prix_inscription: parseFloat(prixInscription),
      statut: 'planifie', // Statut par défaut
      // organisateur_id est géré par le backend (perform_create)
    };

    try {
      await api.post('/tournois/', tournoiData); // L'intercepteur gère le token
      toast.success('Tournoi créé avec succès !');
      navigate('/organisateur/dashboard'); // Rediriger vers le dashboard organisateur
    } catch (error) { // Type 'unknown' est plus sûr que 'any' par défaut
      console.error("Erreur lors de la création du tournoi:", error);
      let errorMessage = "Une erreur inconnue est survenue.";

      // Interface pour la structure attendue des erreurs de validation du backend (DRF)
      interface ValidationErrors {
        [key: string]: string | string[];
        detail?: string; // Pour les erreurs générales non liées à un champ
      }

      // Type pour AxiosError avec la propriété customMessage potentielle
      type AxiosErrorWithCustomMessage = AxiosError<ValidationErrors> & { customMessage?: string };

      if (error instanceof AxiosError) {
        const axiosError = error as AxiosErrorWithCustomMessage;
        
        if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
          const errorData = axiosError.response.data;
          // Gérer l'erreur "detail" en premier si elle existe
          if (errorData.detail && typeof errorData.detail === 'string') {
            toast.error(errorData.detail);
            setIsLoading(false); // Assurez-vous que isLoading est remis à false
            return; // Sortir si une erreur "detail" est affichée
          }

          // Afficher les erreurs de validation spécifiques aux champs
          let hasFieldErrors = false;
          Object.entries(errorData).forEach(([field, messages]) => {
            if (field === 'detail') return; // Déjà géré
            hasFieldErrors = true;
            if (Array.isArray(messages)) {
              messages.forEach(message => toast.error(`${field}: ${message}`));
            } else if (typeof messages === 'string') {
              toast.error(`${field}: ${messages}`);
            }
          });

          if (hasFieldErrors) {
            setIsLoading(false);
            return; // Sortir si des erreurs de champ ont été affichées
          }
          // Si errorData n'est pas vide mais ne correspond pas aux formats attendus, utiliser un message générique
          if (Object.keys(errorData).length > 0) {
             errorMessage = "Erreur de validation du formulaire.";
          }

        } else if (axiosError.customMessage) {
            errorMessage = axiosError.customMessage;
        } else if (axiosError.message) {
            errorMessage = axiosError.message; // Message d'erreur Axios par défaut
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Erreur lors de la création du tournoi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Vérification simple pour s'assurer que l'utilisateur est un organisateur
  // Une protection par route est également nécessaire dans App.tsx
  if (!user || user.role !== 'organisateur') {
    // Ce return ne devrait pas être atteint si la route est bien protégée,
    // mais c'est une sécurité supplémentaire.
    navigate('/');
    return null; 
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Créer un Nouveau Tournoi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nom">Nom du Tournoi</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="type">Type de Tournoi</Label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded">
                  {TYPE_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="regles">Règles (optionnel)</Label>
                <Textarea id="regles" value={regles} onChange={(e) => setRegles(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateDebut">Date de Début</Label>
                  <Input id="dateDebut" type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="dateFin">Date de Fin</Label>
                  <Input id="dateFin" type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label htmlFor="prixInscription">Prix d'Inscription (€)</Label>
                <Input id="prixInscription" type="number" step="0.01" value={prixInscription} onChange={(e) => setPrixInscription(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Création en cours...' : 'Créer le Tournoi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CreerTournoiPage;