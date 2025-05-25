import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from tournois.models import Organisateur

User = get_user_model()

try:
    # Récupérer l'utilisateur
    user = User.objects.get(email='organisateur@organisateur.com')
    print(f"Utilisateur trouvé : {user.email} (rôle : {user.role})")
    
    # Vérifier si le profil organisateur existe déjà
    try:
        organisateur = Organisateur.objects.get(utilisateur=user)
        print(f"Profil organisateur existant trouvé : {organisateur.nom_organisation}")
    except Organisateur.DoesNotExist:
        # Créer le profil organisateur
        organisateur = Organisateur.objects.create(
            utilisateur=user,
            nom_organisation=f"Organisation de {user.username}",
            description="Organisation créée automatiquement"
        )
        print(f"Profil organisateur créé : {organisateur.nom_organisation}")
        
except User.DoesNotExist:
    print("Utilisateur non trouvé")
except Exception as e:
    print(f"Erreur : {str(e)}") 