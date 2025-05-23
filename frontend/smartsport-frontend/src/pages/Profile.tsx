import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar'; // Assuming Navbar is in this path
import Footer from '@/components/Footer'; // Assuming Footer is in this path

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // This should ideally be handled by a protected route component
    // For now, redirect if not logged in (though AuthProvider also tries to load from localStorage)
    navigate('/login');
    return null; 
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Profil de {user.first_name || user.email}</h1>
        
        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3">Informations personnelles</h2>
          <p><strong>Email:</strong> {user.email}</p>
          {user.first_name && <p><strong>Prénom:</strong> {user.first_name}</p>}
          {user.last_name && <p><strong>Nom:</strong> {user.last_name}</p>}
          <p><strong>Rôle:</strong> {user.role}</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Mes tournois inscrits</h2>
          {/* Placeholder for enrolled tournaments list */}
          <p className="text-muted-foreground">La fonctionnalité d'affichage des tournois inscrits sera bientôt disponible.</p>
          {/* 
            TODO: Fetch and display tournaments the user is enrolled in.
            This will likely involve:
            1. An API endpoint on the backend to get tournaments for a user.
            2. A function in `lib/api.ts` to call this endpoint.
            3. State management here (e.g., useState, useEffect, react-query) to fetch and display.
          */}
        </div>

        <Button onClick={handleLogout} variant="destructive" className="mt-8">
          Se déconnecter
        </Button>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;