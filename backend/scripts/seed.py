from django.contrib.auth.hashers import make_password
from tournois.models import Utilisateur, Joueur, Organisateur, Arbitre, Equipe, Tournoi, Rencontre, JoueurEquipe
import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()


# Nettoyage (optionnel, à commenter si besoin)
Utilisateur.objects.all().delete()
Joueur.objects.all().delete()
Organisateur.objects.all().delete()
Arbitre.objects.all().delete()
Equipe.objects.all().delete()
Tournoi.objects.all().delete()
Rencontre.objects.all().delete()
JoueurEquipe.objects.all().delete()

# Utilisateurs
# Ensure only one admin user with specified credentials
Utilisateur.objects.filter(is_superuser=True).exclude(
    email='admin@admin.com').delete()  # Remove other superusers if any
admin, created = Utilisateur.objects.update_or_create(
    email='admin@admin.com',
    defaults={
        'username': 'admin_smartsport',  # Ensure a unique username
        'password': 'admin2025',  # Handled by create_user or set_password
        'role': 'administrateur',
        'is_staff': True,
        'is_superuser': True
    }
)
# Set password if new or changed
if created or not admin.check_password('admin2025'):
    admin.set_password('admin2025')
    admin.save()


orga1 = Utilisateur.objects.create(
    username='organisateur1',
    email='orga1@exemple.com',
    role='organisateur',
    password=make_password('orga1234'),
)
orga2 = Utilisateur.objects.create(
    username='organisateur2',
    email='orga2@exemple.com',
    role='organisateur',
    password=make_password('orga1234'),
)

arbitre1 = Utilisateur.objects.create(
    username='arbitre1',
    email='arbitre1@exemple.com',
    role='arbitre',
    password=make_password('arbitre1234'),
)

adam_user = Utilisateur.objects.create_user(
    username='adamelassad',
    email='adam.elassad@gmail.com',
    # Make sure to use create_user for auto-hashing or make_password
    password='Adam12345678',
    role='joueur',
    first_name='Adam',
    last_name='El Assad'
)

# Profils
orga1_profile = Organisateur.objects.create(
    utilisateur=orga1, nom_organisation="Gaming Lyon")
orga2_profile = Organisateur.objects.create(
    utilisateur=orga2, nom_organisation="Paris eSport")
arbitre1_profile = Arbitre.objects.create(utilisateur=arbitre1)

# Joueurs
joueurs = []
for i in range(1, 7):
    user = Utilisateur.objects.create(
        username=f'joueur{i}',
        email=f'joueur{i}@exemple.com',
        role='joueur',
        password=make_password('joueur1234'),
    )
    joueurs.append(Joueur.objects.create(utilisateur=user, niveau=random.choice(
        ['debutant', 'intermediaire', 'avance'])))

# Add Adam to the list of joueurs if a Joueur profile is needed, or create one separately
adam_joueur_profile = Joueur.objects.create(
    utilisateur=adam_user, niveau='intermediaire')
# Optional: if Adam should be part of the generic 'joueurs' list for team assignment etc.
joueurs.append(adam_joueur_profile)

# Équipes
team1 = Equipe.objects.create(nom="Les Dragons", organisateur=orga1_profile)
team2 = Equipe.objects.create(nom="Les Phoenix", organisateur=orga1_profile)
team3 = Equipe.objects.create(nom="Les Titans", organisateur=orga2_profile)

# Attribution des joueurs aux équipes
JoueurEquipe.objects.create(joueur=joueurs[0], equipe=team1, role="Capitaine")
JoueurEquipe.objects.create(joueur=joueurs[1], equipe=team1, role="Membre")
JoueurEquipe.objects.create(joueur=joueurs[2], equipe=team2, role="Capitaine")
JoueurEquipe.objects.create(joueur=joueurs[3], equipe=team2, role="Membre")
JoueurEquipe.objects.create(joueur=joueurs[4], equipe=team3, role="Capitaine")
JoueurEquipe.objects.create(joueur=joueurs[5], equipe=team3, role="Membre")

# Tournois
now = datetime.now()
tournoi1 = Tournoi.objects.create(
    nom="Tournoi Printemps 2025",
    description="Tournoi annuel de printemps",
    type="solo",
    statut="ouvert",
    date_debut=now + timedelta(days=10),
    date_fin=now + timedelta(days=12),
    organisateur=orga1_profile
)
tournoi2 = Tournoi.objects.create(
    nom="Tournoi Été 2025",
    description="Tournoi d'été pour équipes",
    type="equipe",
    statut="ouvert",
    date_debut=now + timedelta(days=30),
    date_fin=now + timedelta(days=32),
    organisateur=orga2_profile
)

# Rencontres
rencontre1 = Rencontre.objects.create(
    tournoi=tournoi1,
    equipe1=team1,
    equipe2=team2,
    statut="planifie",
    date_heure=now + timedelta(days=11)
)
rencontre2 = Rencontre.objects.create(
    tournoi=tournoi2,
    equipe1=team2,
    equipe2=team3,
    statut="planifie",
    date_heure=now + timedelta(days=31)
)

print("Base de données remplie avec des exemples variés !")
