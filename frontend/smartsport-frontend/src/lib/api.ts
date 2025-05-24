import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Use 'authToken'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour gestion centralisée des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Une erreur est survenue.';
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = error.response.data?.error || 'Requête invalide (400).';
          break;
        case 401:
          message = 'Non autorisé (401). Veuillez vous reconnecter.';
          break;
        case 403:
          message = 'Accès interdit (403).';
          break;
        case 404:
          message = 'Ressource non trouvée (404).';
          break;
        case 500:
          message = 'Erreur interne du serveur (500).';
          break;
        default:
          message = error.response.data?.error || `Erreur (${error.response.status}).`;
      }
      // Log détaillé côté client
      console.error('Erreur API:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      message = "Aucune réponse du serveur. Vérifiez votre connexion internet.";
      console.error('Aucune réponse API:', error.request);
    } else {
      message = error.message;
      console.error('Erreur lors de la configuration de la requête:', error.message);
    }
    // On attache le message pour affichage dans les composants
    error.customMessage = message;
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    // The token and user data will be set in AuthContext by Login.tsx
    // This function just returns the data for Login.tsx to process
    // No need to set localStorage here directly as AuthContext handles it.
    // However, if other parts of the app rely on this direct setting,
    // ensure consistency or refactor them to use AuthContext.
    // For now, let's assume Login.tsx is the primary consumer and will use AuthContext.
    // If direct setting is still desired here for some reason:
    // if (response.data.token) {
    //   localStorage.setItem('authToken', response.data.token);
    // }
    // if (response.data.user) {
    //   localStorage.setItem('authUser', JSON.stringify(response.data.user));
    // }
    return response.data; // Contains { user, token, refresh } from backend
  },

  // The register function below is the one to keep, as it includes optional first_name and last_name
  // The simpler one above this comment block will be removed by this diff.
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    first_name?: string; // Optional fields based on RegisterSerializer
    last_name?: string;  // Optional fields based on RegisterSerializer
  }) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    // This function is now primarily handled by AuthContext.
    // Keeping it here for potential direct calls, but ensure consistency.
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  getCurrentUser: () => {
    // This is now primarily handled by AuthContext.
    const userStr = localStorage.getItem('authUser'); // Use 'authUser'
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    // This is now primarily handled by AuthContext.
    return !!localStorage.getItem('authToken'); // Use 'authToken'
  },
};

export const tournaments = {
  getAll: () => api.get('/tournois/'),
  getById: (id: string) => api.get(`/tournois/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/tournois/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/tournois/${id}/`, data),
  delete: (id: string) => api.delete(`/tournois/${id}/`),
  getMyTournaments: () => api.get('/tournois/mes_tournois/'),
  register: (data: Record<string, unknown>) => 
    api.post('/tournois/inscrire_joueur/', data),
};

export const teams = {
  getAll: () => api.get('/equipes/'),
  getById: (id: string) => api.get(`/equipes/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/equipes/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/equipes/${id}/`, data),
  delete: (id: string) => api.delete(`/equipes/${id}/`),
};

export const matches = {
  getAll: () => api.get('/rencontres/'),
  getById: (id: string) => api.get(`/rencontres/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/rencontres/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/rencontres/${id}/`, data),
  delete: (id: string) => api.delete(`/rencontres/${id}/`),
};

export const utilisateurs = {
  // Add params for filtering, e.g., by role
  getAll: (params?: Record<string, string | number>) => api.get('/utilisateurs/', { params }),
  getById: (id: string | number) => api.get(`/utilisateurs/${id}/`),
  // Add create, update, delete if admins can manage users directly via API
  // For now, focusing on read operations for the dashboard
};

export default api;