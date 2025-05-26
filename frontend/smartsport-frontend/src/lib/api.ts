import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('=== Requête API ===');
  console.log('URL:', config.url);
  console.log('Méthode:', config.method);
  console.log('Token présent:', !!token);
  console.log('Headers:', config.headers);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Headers après ajout du token:', config.headers);
  }
  return config;
}, (error) => {
  console.error('Erreur dans l\'intercepteur de requête:', error);
  return Promise.reject(error);
});

// Intercepteur de réponse pour gestion centralisée des erreurs
api.interceptors.response.use(
  (response) => {
    console.log('=== Réponse API ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);
    console.log('Données:', response.data);
    return response;
  },
  (error) => {
    console.error('=== Erreur API ===');
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    console.error('Données:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log('Token invalide ou expiré, redirection vers login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès non autorisé - Rôle insuffisant');
          break;
        case 404:
          console.error('Ressource non trouvée - URL incorrecte');
          break;
        case 500:
          console.error('Erreur serveur - Problème côté backend');
          break;
        default:
          console.error('Erreur:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login/', { email, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export const tournaments = {
  getAll: () => api.get('/api/tournois/'),
  getById: (id: string) => api.get(`/api/tournois/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/api/tournois/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/tournois/${id}/`, data),
  delete: (id: string) => api.delete(`/api/tournois/${id}/`),
  getMyTournaments: () => api.get('/api/tournois/mes_tournois/'),
  register: (tournoiId: string, data: Record<string, unknown>) => 
    api.post(`/api/tournois/${tournoiId}/inscrire_joueur/`, data),
};

export const teams = {
  getAll: () => api.get('/api/equipes/'),
  getById: (id: string) => api.get(`/api/equipes/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/api/equipes/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/equipes/${id}/`, data),
  delete: (id: string) => api.delete(`/api/equipes/${id}/`),
};

export const matches = {
  getAll: () => api.get('/api/rencontres/'),
  getById: (id: string) => api.get(`/api/rencontres/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/api/rencontres/', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/rencontres/${id}/`, data),
  delete: (id: string) => api.delete(`/api/rencontres/${id}/`),
};

export const utilisateurs = {
  getAll: (params?: Record<string, string | number>) => api.get('/api/utilisateurs/', { params }),
  getById: (id: string | number) => api.get(`/api/utilisateurs/${id}/`),
  update: (id: string | number, data: Record<string, unknown>) => api.patch(`/api/utilisateurs/${id}/`, data),
  delete: (id: string | number) => api.delete(`/api/utilisateurs/${id}/`),
};

export const dashboard = {
  getAdminStats: () => api.get('/api/dashboard/admin/'),
  updateUser: (userId: number, data: Record<string, unknown>) => api.patch(`/api/utilisateurs/${userId}/`, data),
  deleteUser: (userId: number) => api.delete(`/api/utilisateurs/${userId}/`),
  deleteTournament: (tournoiId: number) => api.delete(`/api/tournois/${tournoiId}/`),
};

export default api;