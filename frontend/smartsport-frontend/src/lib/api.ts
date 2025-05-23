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
  const token = localStorage.getItem('token');
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
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const tournaments = {
  getAll: () => api.get('/tournois/'),
  getById: (id: string) => api.get(`/tournois/${id}/`),
  create: (data: any) => api.post('/tournois/', data),
  update: (id: string, data: any) => api.put(`/tournois/${id}/`, data),
  delete: (id: string) => api.delete(`/tournois/${id}/`),
};

export const teams = {
  getAll: () => api.get('/equipes/'),
  getById: (id: string) => api.get(`/equipes/${id}/`),
  create: (data: any) => api.post('/equipes/', data),
  update: (id: string, data: any) => api.put(`/equipes/${id}/`, data),
  delete: (id: string) => api.delete(`/equipes/${id}/`),
};

export const matches = {
  getAll: () => api.get('/rencontres/'),
  getById: (id: string) => api.get(`/rencontres/${id}/`),
  create: (data: any) => api.post('/rencontres/', data),
  update: (id: string, data: any) => api.put(`/rencontres/${id}/`, data),
  delete: (id: string) => api.delete(`/rencontres/${id}/`),
};

export default api;