import axios from 'axios';
import { User } from '@/integrations/supabase/types';

interface LoginResponse {
  user: User;
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post('/api/auth/login/', { email, password });
    const { token, user } = response.data;
    
    // Store the token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Échec de la connexion');
    }
    throw new Error('Une erreur est survenue lors de la connexion');
  }
}; 