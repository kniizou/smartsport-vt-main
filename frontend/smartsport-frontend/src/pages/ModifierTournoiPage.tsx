import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const TYPE_CHOICES = [
  { value: 'elimination', label: 'Élimination simple' },
  { value: 'round-robin', label: 'Round Robin' },
  { value: 'mixte', label: 'Format mixte' },
];

interface TournoiFormData {
  nom: string;
  description: string;
  type: string;
  regles: string;
  date_debut: string;
  date_fin: string;
  prix_inscription: string; // Garder en string pour le formulaire, convertir avant envoi
  statut: string;
}

// Interface pour la structure attendue des erreurs de validation du backend (DRF)
interface ValidationErrors {
  [key: string]: string | string[];
  detail?: string; 
}
type AxiosErrorWithCustomMessage = AxiosError<ValidationErrors> & { customMessage?: string };


const ModifierTournoiPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: tournoiId } = useParams<{ id: string }>(); // Récupérer l'ID du tournoi depuis l'URL

  const [formData, setFormData] = useState<TournoiFormData>({
    nom: '',
    description: '',
    type: TYPE_CHOICES[0].value,
    regles: '',
    date_debut: '',
    date_fin: '',
    prix_inscription: '0',
    statut: 'planifie',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!tournoiId) {
      toast.error("ID du tournoi manquant.");
      navigate('/organisateur/dashboard');
      return;
    }

    const fetchTournoi = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/api/tournois/${tournoiId}/`);
        const tournoi = response.data;
        setFormData({
          nom: tournoi.nom,
          description: tournoi.description,
          type: tournoi.type,
          regles: tournoi.regles || '',
          // Formater les dates pour les inputs datetime-local (YYYY-MM-DDTHH:mm)
          date_debut: tournoi.date_debut ? new Date(tournoi.date_debut).toISOString().slice(0, 16) : '',
          date_fin: tournoi.date_fin ? new Date(tournoi.date_fin).toISOString().slice(0, 16) : '',
          prix_inscription: tournoi.prix_inscription?.toString() || '0',
          statut: tournoi.statut,
        });
      } catch (error) {
        toast.error("Erreur lors de la récupération des détails du tournoi.");
        console.error("Fetch tournoi error:", error);
        navigate('/organisateur/dashboard');
      } finally {
        setIsFetching(false);
      }
    };

    fetchTournoi();
  }, [tournoiId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user || user.role !== 'organisateur') {
      toast.error("Action non autorisée.");
      setIsLoading(false);
      navigate('/');
      return;
    }

    const tournoiDataToSubmit = {
      ...formData,
      prix_inscription: parseFloat(formData.prix_inscription),
    };

    try {
      await api.put(`/api/tournois/${tournoiId}/`, tournoiDataToSubmit);
      toast.success('Tournoi mis à jour avec succès !');
      navigate('/organisateur/dashboard');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du tournoi:", error);
      let errorMessage = "Une erreur inconnue est survenue.";
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosErrorWithCustomMessage;
        if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
          const errorData = axiosError.response.data;
          if (errorData.detail && typeof errorData.detail === 'string') {
            toast.error(errorData.detail);
            setIsLoading(false);
            return;
          }
          let hasFieldErrors = false;
          Object.entries(errorData).forEach(([field, messages]) => {
            if (field === 'detail') return;
            hasFieldErrors = true;
            if (Array.isArray(messages)) {
              messages.forEach(message => toast.error(`${field}: ${message}`));
            } else if (typeof messages === 'string') {
              toast.error(`${field}: ${messages}`);
            }
          });
          if (hasFieldErrors) {
            setIsLoading(false);
            return;
          }
          if (Object.keys(errorData).length > 0) {
             errorMessage = "Erreur de validation du formulaire.";
          }
        } else if (axiosError.customMessage) {
            errorMessage = axiosError.customMessage;
        } else if (axiosError.message) {
            errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">Chargement du tournoi...</div>
        <Footer />
      </div>
    );
  }
  
  if (!user || user.role !== 'organisateur') {
    navigate('/');
    return null; 
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Modifier le Tournoi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nom">Nom du Tournoi</Label>
                <Input id="nom" value={formData.nom} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="type">Type de Tournoi</Label>
                <select id="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded">
                  {TYPE_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="regles">Règles (optionnel)</Label>
                <Textarea id="regles" value={formData.regles} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_debut">Date de Début</Label>
                  <Input id="date_debut" type="datetime-local" value={formData.date_debut} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="date_fin">Date de Fin</Label>
                  <Input id="date_fin" type="datetime-local" value={formData.date_fin} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="prix_inscription">Prix d'Inscription (€)</Label>
                <Input id="prix_inscription" type="number" step="0.01" value={formData.prix_inscription} onChange={handleChange} required />
              </div>
               <div>
                <Label htmlFor="statut">Statut</Label>
                <Input id="statut" value={formData.statut} onChange={handleChange} disabled /> 
                {/* Le statut est géré par une action dédiée, on l'affiche ici mais on ne le modifie pas directement */}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isFetching}>
                {isLoading ? 'Mise à jour en cours...' : 'Mettre à Jour le Tournoi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ModifierTournoiPage;