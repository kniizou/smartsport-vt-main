from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import (
    Utilisateur, Joueur, Organisateur, Arbitre,
    Equipe, Tournoi, Rencontre, Paiement, JoueurEquipe,
    FAQ, CategorieFAQ, Administrateur
)
from decimal import Decimal
from django.utils import timezone
import time
import json
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta


class UtilisateurTests(APITestCase):
    def setUp(self):
        self.admin_user = Utilisateur.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            role='administrateur',
            first_name='Admin',
            last_name='User'
        )
        self.admin = Administrateur.objects.create(utilisateur=self.admin_user)
        self.client.force_authenticate(user=self.admin_user)

    def test_create_utilisateur(self):
        url = reverse('utilisateur-list')
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'testpass123',
            'role': 'joueur',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Utilisateur.objects.count(), 2)

    def test_create_utilisateur_invalid_data(self):
        url = reverse('utilisateur-list')
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'testpass123',
            'role': 'invalid-role',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_utilisateur(self):
        user = Utilisateur.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            role='joueur',
            first_name='Test',
            last_name='User'
        )
        url = reverse('utilisateur-detail', args=[user.id])
        data = {
            'first_name': 'Updated',
            'last_name': 'User'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Updated')


class TournoiTests(APITestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username='organisateur1',
            email='org1@test.com',
            password='testpass123',
            role='organisateur',
            first_name='Organisateur',
            last_name='Test'
        )
        self.organisateur = Organisateur.objects.create(utilisateur=self.user)
        self.client.force_authenticate(user=self.user)

    def test_create_tournoi(self):
        url = reverse('tournoi-list')
        data = {
            'nom': 'Tournoi Test',
            'description': 'Description test',
            'date_debut': (timezone.now() + timedelta(days=7)).date(),
            'date_fin': (timezone.now() + timedelta(days=8)).date(),
            'prix_inscription': 50,
            'organisateur': self.organisateur.utilisateur_id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tournoi.objects.count(), 1)
        self.assertEqual(Tournoi.objects.get().nom, 'Tournoi Test')

    def test_inscrire_equipe(self):
        tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )
        url = reverse('equipe-list')
        data = {
            'nom': 'Equipe Test',
            'tournoi': tournoi.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Equipe.objects.count(), 1)


class RencontreTests(APITestCase):
    def setUp(self):
        self.arbitre_user = Utilisateur.objects.create_user(
            username='arbitre1',
            email='arbitre1@test.com',
            password='testpass123',
            role='arbitre',
            first_name='Arbitre',
            last_name='Test'
        )
        self.arbitre = Arbitre.objects.create(utilisateur=self.arbitre_user)
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create_user(
                username='organisateur1',
                email='org1@test.com',
                password='testpass123',
                role='organisateur',
                first_name='Organisateur',
                last_name='Test'
            )
        )
        self.tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )
        # Créer deux équipes avec organisateur obligatoire
        self.equipe1 = Equipe.objects.create(
            nom='Equipe 1',
            organisateur=self.organisateur
        )
        self.equipe2 = Equipe.objects.create(
            nom='Equipe 2',
            organisateur=self.organisateur
        )
        self.rencontre = Rencontre.objects.create(
            tournoi=self.tournoi,
            equipe1=self.equipe1,
            equipe2=self.equipe2,
            arbitre=self.arbitre,
            date_heure=timezone.now() + timedelta(days=7),
            statut='planifie'
        )
        self.client.force_authenticate(user=self.arbitre_user)

    def test_validation_score_match_termine(self):
        url = reverse('rencontre-detail', args=[self.rencontre.id])
        data = {
            'score1': 21,
            'score2': 19,
            'statut': 'termine'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valider_score_invalid(self):
        url = reverse('rencontre-detail', args=[self.rencontre.id])
        data = {
            'score1': -1,
            'score2': 21,
            'statut': 'termine'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PaiementTests(APITestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username='joueur1',
            email='joueur1@test.com',
            password='testpass123',
            role='joueur',
            first_name='Joueur',
            last_name='Test'
        )
        self.joueur = Joueur.objects.create(utilisateur=self.user)
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create_user(
                username='organisateur1',
                email='org1@test.com',
                password='testpass123',
                role='organisateur',
                first_name='Organisateur',
                last_name='Test'
            )
        )
        self.tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )
        self.client.force_authenticate(user=self.user)

    def test_valider_paiement(self):
        url = reverse('paiement-list')
        data = {
            'montant': 50,
            'tournoi': self.tournoi.id,
            'joueur': self.joueur.utilisateur_id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Paiement.objects.count(), 1)


class PerformanceTests(APITestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username='organisateur1',
            email='org1@test.com',
            password='testpass123',
            role='organisateur',
            first_name='Organisateur',
            last_name='Test'
        )
        self.organisateur = Organisateur.objects.create(utilisateur=self.user)
        self.tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )
        self.client.force_authenticate(user=self.user)

    def test_creation_multiple_tournois(self):
        url = reverse('tournoi-list')
        for i in range(5):
            data = {
                'nom': f'Tournoi {i}',
                'description': f'Description du tournoi {i}',
                'date_debut': (timezone.now() + timedelta(days=7)).date(),
                'date_fin': (timezone.now() + timedelta(days=8)).date(),
                'prix_inscription': 50,
                'organisateur': self.organisateur.utilisateur_id
            }
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tournoi.objects.count(), 6)

    def test_inscription_multiple_equipes(self):
        url = reverse('equipe-list')
        for i in range(5):
            data = {
                'nom': f'Equipe {i}',
                'tournoi': self.tournoi.id
            }
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Equipe.objects.count(), 5)

    def test_liste_equipes_filtree(self):
        for i in range(5):
            Equipe.objects.create(
                nom=f'Equipe {i}',
                tournoi=self.tournoi
            )
        url = reverse('equipe-list')
        response = self.client.get(f"{url}?tournoi={self.tournoi.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

    def test_recherche_utilisateurs(self):
        for i in range(5):
            Utilisateur.objects.create_user(
                username=f'user{i}',
                email=f'user{i}@test.com',
                password='testpass123',
                role='joueur',
                first_name=f'First{i}',
                last_name=f'Last{i}'
            )
        url = reverse('utilisateur-list')
        response = self.client.get(f"{url}?role=joueur")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)


class IntegrationTests(APITestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username='organisateur1',
            email='org1@test.com',
            password='testpass123',
            role='organisateur',
            first_name='Organisateur',
            last_name='Test'
        )
        self.organisateur = Organisateur.objects.create(utilisateur=self.user)
        self.client.force_authenticate(user=self.user)

    def test_flux_complet_tournoi(self):
        # Créer un tournoi
        url = reverse('tournoi-list')
        data = {
            'nom': 'Tournoi Test',
            'description': 'Description test',
            'date_debut': (timezone.now() + timedelta(days=7)).date(),
            'date_fin': (timezone.now() + timedelta(days=8)).date(),
            'prix_inscription': 50,
            'organisateur': self.organisateur.utilisateur_id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tournoi_id = response.data['id']

        # Créer une équipe
        url = reverse('equipe-list')
        data = {
            'nom': 'Equipe Test',
            'tournoi': tournoi_id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Créer un paiement
        url = reverse('paiement-list')
        data = {
            'montant': 50,
            'tournoi': tournoi_id,
            'joueur': self.organisateur.utilisateur_id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_flux_equipe(self):
        # Créer un tournoi
        tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )

        # Créer une équipe
        url = reverse('equipe-list')
        data = {
            'nom': 'Equipe Test',
            'tournoi': tournoi.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Ajouter un joueur à l'équipe
        url = reverse('equipe-detail', args=[response.data['id']])
        data = {
            'joueurs': [self.organisateur.utilisateur_id]
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_flux_paiement(self):
        # Créer un tournoi
        tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )

        # Créer un paiement
        url = reverse('paiement-list')
        data = {
            'montant': 50,
            'tournoi': tournoi.id,
            'joueur': self.organisateur.utilisateur_id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Valider le paiement
        url = reverse('paiement-detail', args=[response.data['id']])
        data = {
            'statut': 'valide'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class SecurityTests(APITestCase):
    def setUp(self):
        self.admin_user = Utilisateur.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            role='administrateur',
            first_name='Admin',
            last_name='User'
        )
        self.admin = Administrateur.objects.create(utilisateur=self.admin_user)
        self.client.force_authenticate(user=self.admin_user)

    def test_csrf_protection(self):
        self.client.force_authenticate(user=None)
        url = reverse('utilisateur-list')
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'testpass123',
            'role': 'joueur',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_injection_sql_utilisateur(self):
        url = reverse('utilisateur-list')
        response = self.client.get(f"{url}?username=test' OR '1'='1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Seulement l'utilisateur admin

    def test_rate_limiting(self):
        url = reverse('utilisateur-list')
        for _ in range(100):
            response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_xss_utilisateur(self):
        url = reverse('utilisateur-list')
        data = {
            'username': '<script>alert("XSS")</script>',
            'email': 'test@test.com',
            'password': 'testpass123',
            'role': 'joueur',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jwt_token_security(self):
        url = reverse('utilisateur-list')
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'testpass123',
            'role': 'joueur',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('token', response.data)


class APIFeaturesTests(APITestCase):
    """
    Tests des fonctionnalités API (pagination, filtres, gestion d'erreurs)
    """
    def setUp(self):
        # Créer un administrateur
        self.admin = Utilisateur.objects.create(
            username="admin",
            email="admin@test.com",
            password="password123",
            role="administrateur",
            first_name="Admin",
            last_name="User"
        )
        self.client.force_authenticate(user=self.admin)

        # Créer un organisateur
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="org",
                email="org@test.com",
                password="password123",
                role="organisateur",
                first_name="Organisateur",
                last_name="Test"
            ),
            nom_organisation="Test Org"
        )

        # Créer plusieurs tournois pour tester la pagination
        for i in range(15):
            Tournoi.objects.create(
                nom=f"Tournament {i}",
                description=f"Description {i}",
                type="elimination",
                date_debut=timezone.now() + timezone.timedelta(days=1),
                date_fin=timezone.now() + timezone.timedelta(days=2),
                organisateur=self.organisateur
            )

    def test_pagination_tournois(self):
        """
        Test de la pagination des tournois
        """
        # Tester la première page
        response = self.client.get('/api/tournois/?page=1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)  # Page size par défaut
        
        # Tester la deuxième page
        response = self.client.get('/api/tournois/?page=2')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 5)  # Reste des tournois

    def test_filtres_tournois(self):
        """
        Test des filtres sur les tournois
        """
        # Test du filtre par type
        response = self.client.get(reverse('tournoi-list'), {'type': 'elimination'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(t['type'] == 'elimination' for t in response.data['results']))

        # Test du filtre par date
        date_debut = (timezone.now() + timezone.timedelta(days=5)).isoformat()
        response = self.client.get(reverse('tournoi-list'), {'date_debut': date_debut})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(t['date_debut'] >= date_debut for t in response.data['results']))

    def test_gestion_erreurs_api(self):
        """
        Test de la gestion des erreurs API
        """
        # Test erreur 404
        response = self.client.get(reverse('tournoi-detail', args=[999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)

        # Test erreur 400 (données invalides)
        response = self.client.post(
            reverse('tournoi-list'),
            {
                'nom': 'Test',
                'description': 'Test',
                'type': 'invalid_type',  # Type invalide
                'date_debut': 'invalid_date',  # Date invalide
                'date_fin': 'invalid_date',
                'prix_inscription': -100  # Prix négatif
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('type', response.data)
        self.assertIn('date_debut', response.data)
        self.assertIn('prix_inscription', response.data)

        # Test erreur 403 (permission refusée)
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse('tournoi-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MatchManagementTests(APITestCase):
    """
    Tests de la gestion des matchs et de la validation des scores
    """
    def setUp(self):
        # Créer un arbitre
        self.arbitre = Arbitre.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="arbitre",
                email="arbitre@test.com",
                password="password123",
                role="arbitre",
                first_name="Arbitre",
                last_name="Test"
            )
        )
        
        # Créer un organisateur
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="org",
                email="org@test.com",
                password="password123",
                role="organisateur",
                first_name="Organisateur",
                last_name="Test"
            ),
            nom_organisation="Test Org"
        )
        
        # Créer un tournoi
        self.tournoi = Tournoi.objects.create(
            nom="Test Tournament",
            description="Test Description",
            type="elimination",
            date_debut=timezone.now() + timezone.timedelta(days=1),
            date_fin=timezone.now() + timezone.timedelta(days=2),
            prix_inscription=50.00,
            statut='planifie',
            organisateur=self.organisateur
        )
        
        # Créer deux équipes
        self.equipe1 = Equipe.objects.create(
            nom="Team 1",
            organisateur=self.organisateur
        )
        self.equipe2 = Equipe.objects.create(
            nom="Team 2",
            organisateur=self.organisateur
        )

    def test_planification_match(self):
        """
        Test de la planification d'un match
        """
        self.client.force_authenticate(user=self.organisateur.utilisateur)
        
        # Créer un match
        match_data = {
            'tournoi': self.tournoi.id,
            'equipe1': self.equipe1.id,
            'equipe2': self.equipe2.id,
            'date_heure': (timezone.now() + timezone.timedelta(hours=1)).isoformat(),
            'duree': 60,
            'arbitre': self.arbitre.id
        }
        
        response = self.client.post(reverse('rencontre-list'), match_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rencontre.objects.count(), 1)
        
        # Vérifier les détails du match
        match = Rencontre.objects.get()
        self.assertEqual(match.tournoi, self.tournoi)
        self.assertEqual(match.equipe1, self.equipe1)
        self.assertEqual(match.equipe2, self.equipe2)
        self.assertEqual(match.arbitre, self.arbitre)
        self.assertEqual(match.statut, 'planifie')

    def test_validation_score_arbitre(self):
        """
        Test de la validation des scores par l'arbitre
        """
        # Créer un match
        match = Rencontre.objects.create(
            tournoi=self.tournoi,
            equipe1=self.equipe1,
            equipe2=self.equipe2,
            date_heure=timezone.now() + timezone.timedelta(hours=1),
            duree=60,
            arbitre=self.arbitre
        )
        
        # Authentifier l'arbitre
        self.client.force_authenticate(user=self.arbitre.utilisateur)
        
        # Valider le score
        score_data = {
            'score1': 2,
            'score2': 1
        }
        response = self.client.post(
            reverse('rencontre-valider-score', args=[match.id]),
            score_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier le score
        match.refresh_from_db()
        self.assertEqual(match.score1, 2)
        self.assertEqual(match.score2, 1)
        self.assertEqual(match.statut, 'termine')

    def test_validation_score_non_arbitre(self):
        """
        Test de la validation des scores par un non-arbitre
        """
        # Créer un match
        match = Rencontre.objects.create(
            tournoi=self.tournoi,
            equipe1=self.equipe1,
            equipe2=self.equipe2,
            date_heure=timezone.now() + timezone.timedelta(hours=1),
            duree=60,
            arbitre=self.arbitre
        )
        
        # Authentifier l'organisateur (qui n'est pas l'arbitre)
        self.client.force_authenticate(user=self.organisateur.utilisateur)
        
        # Tenter de valider le score
        score_data = {
            'score1': 2,
            'score2': 1
        }
        response = self.client.post(
            reverse('rencontre-valider-score', args=[match.id]),
            score_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Vérifier que le score n'a pas été modifié
        match.refresh_from_db()
        self.assertIsNone(match.score1)
        self.assertIsNone(match.score2)
        self.assertEqual(match.statut, 'planifie')

    def test_validation_score_match_termine(self):
        # Créer un match terminé
        match = Rencontre.objects.create(
            tournoi=self.tournoi,
            equipe1=self.equipe1,
            equipe2=self.equipe2,
            date_heure=timezone.now() - timezone.timedelta(days=1),
            statut='termine',
            score1=2,
            score2=1
        )
        
        # Tenter de modifier le score
        url = f'/api/rencontres/{match.id}/'
        data = {
            'score1': 3,
            'score2': 2
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        match.refresh_from_db()
        self.assertEqual(match.score1, 2)
        self.assertEqual(match.score2, 1)


class DateValidationTests(APITestCase):
    """
    Tests de validation des dates pour les tournois et matchs
    """
    def setUp(self):
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="org",
                email="org@test.com",
                password="password123",
                role="organisateur",
                first_name="Organisateur",
                last_name="Test"
            ),
            nom_organisation="Test Org"
        )
        self.client.force_authenticate(user=self.organisateur.utilisateur)

    def test_tournoi_date_passee(self):
        url = reverse('tournoi-list')
        data = {
            'nom': 'Tournoi Passé',
            'description': 'Test Description',
            'type': 'elimination',
            'date_debut': (timezone.now() - timezone.timedelta(days=1)).isoformat(),
            'date_fin': (timezone.now() + timezone.timedelta(days=1)).isoformat(),
            'prix_inscription': 50.00,
            'organisateur': self.organisateur.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_debut', response.data)

    def test_tournoi_dates_invalides(self):
        url = reverse('tournoi-list')
        data = {
            'nom': 'Tournoi Dates Invalides',
            'description': 'Test Description',
            'type': 'elimination',
            'date_debut': 'date-invalide',
            'date_fin': 'date-invalide',
            'prix_inscription': 50.00,
            'organisateur': self.organisateur.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_debut', response.data)
        self.assertIn('date_fin', response.data)

    def test_match_date_passee(self):
        url = reverse('rencontre-list')
        data = {
            'tournoi': self.tournoi.id,
            'equipe1': self.equipe1.id,
            'equipe2': self.equipe2.id,
            'date_heure': (timezone.now() - timezone.timedelta(hours=1)).isoformat(),
            'duree': 60,
            'arbitre': self.arbitre.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_heure', response.data)


class ParticipantLimitTests(APITestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username='organisateur1',
            email='org1@test.com',
            password='testpass123',
            role='organisateur',
            first_name='Organisateur',
            last_name='Test'
        )
        self.organisateur = Organisateur.objects.create(utilisateur=self.user)
        self.tournoi = Tournoi.objects.create(
            nom='Tournoi Test',
            description='Description test',
            date_debut=(timezone.now() + timedelta(days=7)).date(),
            date_fin=(timezone.now() + timedelta(days=8)).date(),
            prix_inscription=50,
            organisateur=self.organisateur
        )
        self.client.force_authenticate(user=self.user)

    def test_limite_participants(self):
        url = reverse('equipe-list')
        for i in range(3):
            data = {
                'nom': f'Equipe {i}',
                'tournoi': self.tournoi.id
            }
            response = self.client.post(url, data, format='json')
            if i < 2:
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            else:
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ConcurrencyTests(APITestCase):
    """
    Tests de concurrence pour les opérations critiques
    """
    def setUp(self):
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="org",
                email="org@test.com",
                password="password123",
                role="organisateur",
                first_name="Organisateur",
                last_name="Test"
            ),
            nom_organisation="Test Org"
        )
        self.client.force_authenticate(user=self.organisateur.utilisateur)
        
        # Créer un tournoi
        self.tournoi = Tournoi.objects.create(
            nom="Tournoi Concurrence",
            description="Test Description",
            type="elimination",
            date_debut=timezone.now() + timezone.timedelta(days=1),
            date_fin=timezone.now() + timezone.timedelta(days=2),
            organisateur=self.organisateur,
            nombre_equipes_max=10
        )
        
        # Créer plusieurs équipes
        self.equipes = []
        for i in range(10):
            equipe = Equipe.objects.create(
                nom=f"Team {i}",
                organisateur=self.organisateur
            )
            self.equipes.append(equipe)

    def test_inscription_concurrente(self):
        """
        Test d'inscription concurrente d'équipes
        """
        def inscrire_equipe(equipe_id):
            client = APIClient()
            client.force_authenticate(user=self.organisateur.utilisateur)
            return client.post(
                reverse('tournoi-inscrire-equipe', args=[self.tournoi.id]),
                {'equipe_id': equipe_id},
                format='json'
            )

        # Tenter d'inscrire plusieurs équipes simultanément
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(inscrire_equipe, equipe.id) for equipe in self.equipes]
            responses = [future.result() for future in futures]

        # Vérifier que toutes les inscriptions ont réussi
        self.assertTrue(all(r.status_code == status.HTTP_201_CREATED for r in responses))
        
        # Vérifier que le nombre d'équipes inscrites est correct
        self.assertEqual(self.tournoi.equipes.count(), 10)

    def test_validation_score_concurrente(self):
        """
        Test de validation concurrente des scores
        """
        # Créer un arbitre
        arbitre = Arbitre.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="arbitre",
                email="arbitre@test.com",
                password="password123",
                role="arbitre",
                first_name="Arbitre",
                last_name="Test"
            )
        )
        
        # Créer un match
        match = Rencontre.objects.create(
            tournoi=self.tournoi,
            equipe1=self.equipes[0],
            equipe2=self.equipes[1],
            date_heure=timezone.now() + timezone.timedelta(hours=1),
            duree=60,
            arbitre=arbitre
        )

        def valider_score(score1, score2):
            client = APIClient()
            client.force_authenticate(user=arbitre.utilisateur)
            return client.post(
                reverse('rencontre-valider-score', args=[match.id]),
                {'score1': score1, 'score2': score2},
                format='json'
            )

        # Tenter de valider plusieurs scores simultanément
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(valider_score, 2, 1),
                executor.submit(valider_score, 3, 2),
                executor.submit(valider_score, 1, 1)
            ]
            responses = [future.result() for future in futures]

        # Vérifier qu'une seule validation a réussi
        self.assertEqual(sum(1 for r in responses if r.status_code == status.HTTP_200_OK), 1)
        
        # Vérifier que le match a un score valide
        match.refresh_from_db()
        self.assertIsNotNone(match.score1)
        self.assertIsNotNone(match.score2)


class AdvancedPerformanceTests(APITestCase):
    """
    Tests de performance avancés
    """
    def setUp(self):
        self.admin = Utilisateur.objects.create(
            username="admin",
            email="admin@test.com",
            password="password123",
            role="administrateur",
            first_name="Admin",
            last_name="User"
        )
        self.client.force_authenticate(user=self.admin)
        self.organisateur = Organisateur.objects.create(
            utilisateur=Utilisateur.objects.create(
                username="org",
                email="org@test.com",
                password="password123",
                role="organisateur",
                first_name="Organisateur",
                last_name="Test"
            ),
            nom_organisation="Test Org"
        )
        self.joueurs = []
        for i in range(1000):
            joueur = Joueur.objects.create(
                utilisateur=Utilisateur.objects.create(
                    username=f"joueur{i}",
                    email=f"joueur{i}@test.com",
                    password="password123",
                    role="joueur",
                    first_name=f"First{i}",
                    last_name=f"Last{i}"
                )
            )
            self.joueurs.append(joueur)
        self.equipes = []
        for i in range(100):
            equipe = Equipe.objects.create(
                nom=f"Team {i}",
                organisateur=self.organisateur
            )
            self.equipes.append(equipe)

    def test_charge_elevee_utilisateurs(self):
        """
        Test de performance avec un grand nombre d'utilisateurs
        """
        start_time = time.time()
        
        # Test de la liste des utilisateurs avec pagination
        response = self.client.get(reverse('utilisateur-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test de la recherche d'utilisateurs
        response = self.client.get(
            reverse('utilisateur-list'),
            {'search': 'joueur', 'page': 1, 'page_size': 100}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        end_time = time.time()
        self.assertLess(end_time - start_time, 2.0)  # Doit prendre moins de 2 secondes

    def test_charge_elevee_equipes(self):
        """
        Test de performance avec un grand nombre d'équipes
        """
        # Ajouter des joueurs aux équipes
        for i, equipe in enumerate(self.equipes):
            for j in range(5):  # 5 joueurs par équipe
                JoueurEquipe.objects.create(
                    joueur=self.joueurs[i*5 + j],
                    equipe=equipe,
                    role='membre'
                )

        start_time = time.time()
        
        # Test de la liste des équipes avec filtres
        response = self.client.get(
            reverse('equipe-list'),
            {
                'organisateur': self.organisateur.id,
                'page': 1,
                'page_size': 50
            }
        )
        end_time = time.time()
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLess(end_time - start_time, 2.0)  # Doit prendre moins de 2 secondes

    def test_performance_recherche_avancee(self):
        """
        Test de performance pour la recherche avancée
        """
        start_time = time.time()
        
        # Test de recherche avec plusieurs filtres
        response = self.client.get(
            reverse('utilisateur-list'),
            {
                'search': 'joueur',
                'role': 'joueur',
                'page': 1,
                'page_size': 50,
                'ordering': '-date_inscription'
            }
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        end_time = time.time()
        self.assertLess(end_time - start_time, 1.0)  # Doit prendre moins d'une seconde


class FAQTests(APITestCase):
    def setUp(self):
        self.admin_user = Utilisateur.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            role='administrateur',
            first_name='Admin',
            last_name='User'
        )
        self.admin = Administrateur.objects.create(utilisateur=self.admin_user)
        self.normal_user = Utilisateur.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123',
            role='joueur',
            first_name='Joueur',
            last_name='Test'
        )
        self.categorie = CategorieFAQ.objects.create(
            nom='Général',
            description='Questions générales'
        )
        self.faq = FAQ.objects.create(
            question='Comment s\'inscrire ?',
            reponse='Pour vous inscrire, cliquez sur le bouton Inscription.',
            categorie=self.categorie
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_liste_faq_public(self):
        self.client.force_authenticate(user=None)
        url = reverse('faq-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_creation_faq_admin(self):
        url = reverse('faq-list')
        data = {
            'question': 'Comment payer ?',
            'reponse': 'Vous pouvez payer par carte bancaire.',
            'categorie': self.categorie.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FAQ.objects.count(), 2)

    def test_creation_faq_non_admin(self):
        self.client.force_authenticate(user=self.normal_user)
        url = reverse('faq-list')
        data = {
            'question': 'Comment payer ?',
            'reponse': 'Vous pouvez payer par carte bancaire.',
            'categorie': self.categorie.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_modification_faq_admin(self):
        url = reverse('faq-detail', args=[self.faq.id])
        data = {
            'question': 'Comment s\'inscrire au tournoi ?',
            'reponse': 'Pour vous inscrire au tournoi, cliquez sur le bouton Inscription.',
            'categorie': self.categorie.id
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.faq.refresh_from_db()
        self.assertEqual(self.faq.question, 'Comment s\'inscrire au tournoi ?')

    def test_suppression_faq_admin(self):
        url = reverse('faq-detail', args=[self.faq.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FAQ.objects.count(), 0)
