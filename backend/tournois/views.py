from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
# Importez les modèles nécessaires
from .models import Joueur, Organisateur, Arbitre, Utilisateur, Paiement, Equipe, JoueurEquipe, Tournoi, Rencontre, FAQ, InscriptionTournoi
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    UtilisateurSerializer, JoueurSerializer, OrganisateurSerializer,
    ArbitreSerializer, PaiementSerializer, EquipeSerializer,
    JoueurEquipeSerializer, TournoiSerializer, RencontreSerializer, RegisterSerializer, UserSerializer
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import FAQSerializer
from .serializers import DashboardAdminSerializer
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows access only to admin users.
    Safe methods (GET, HEAD, OPTIONS) are also restricted to admins for this specific permission class
    if we want to ensure only admins can list all users.
    If GET should be public for some views using this, a different permission or logic is needed.
    For UtilisateurViewSet, listing all users should likely be admin-only.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'administrateur'


class IsOrganisateurOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'organisateur'


class IsArbitreOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'arbitre'


class UtilisateurViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les utilisateurs

    Permet de :
    - Lister tous les utilisateurs (admin uniquement)
    - Créer un nouvel utilisateur (admin uniquement)
    - Récupérer les détails d'un utilisateur
    - Mettre à jour un utilisateur (admin uniquement)
    - Supprimer un utilisateur (admin uniquement)
    """
    queryset = User.objects.all()
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role']
    search_fields = ['first_name', 'last_name', 'email']

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Active/désactive un utilisateur
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()

        return Response({
            'status': 'success',
            'message': f"L'utilisateur a été {'activé' if user.is_active else 'désactivé'}",
            'is_active': user.is_active
        })

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Delete associated profile first
        if hasattr(user, 'joueur_profile'):
            user.joueur_profile.delete()
        elif hasattr(user, 'organisateur_profile'):
            user.organisateur_profile.delete()
        elif hasattr(user, 'arbitre_profile'):
            user.arbitre_profile.delete()

        # Then delete the user
        user.delete()
        return Response({
            'status': 'success',
            'message': "L'utilisateur a été supprimé"
        }, status=status.HTTP_200_OK)


class JoueurViewSet(viewsets.ModelViewSet):
    queryset = Joueur.objects.all()
    serializer_class = JoueurSerializer
    # Modifié pour restreindre l'accès aux administrateurs
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['niveau']
    search_fields = ['utilisateur__first_name',
                     'utilisateur__last_name', 'utilisateur__email']


class OrganisateurViewSet(viewsets.ModelViewSet):
    queryset = Organisateur.objects.all()
    serializer_class = OrganisateurSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_organisation',
                     'utilisateur__first_name', 'utilisateur__last_name']


class ArbitreViewSet(viewsets.ModelViewSet):
    queryset = Arbitre.objects.all()
    serializer_class = ArbitreSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['utilisateur__first_name', 'utilisateur__last_name']


class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['statut', 'methode']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'administrateur':
            return Paiement.objects.all()
        return Paiement.objects.filter(joueur__utilisateur=user)


class EquipeViewSet(viewsets.ModelViewSet):
    queryset = Equipe.objects.all()
    serializer_class = EquipeSerializer
    permission_classes = [IsOrganisateurOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['organisateur']
    search_fields = ['nom']

    def perform_create(self, serializer):
        serializer.save(organisateur=self.request.user.organisateur_profile)


class JoueurEquipeViewSet(viewsets.ModelViewSet):
    queryset = JoueurEquipe.objects.all()
    serializer_class = JoueurEquipeSerializer
    permission_classes = [IsOrganisateurOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['equipe', 'role']


class TournoiViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les tournois

    Permet de :
    - Lister tous les tournois
    - Créer un nouveau tournoi (organisateur uniquement)
    - Récupérer les détails d'un tournoi
    - Mettre à jour un tournoi (organisateur uniquement)
    - Supprimer un tournoi (organisateur uniquement)
    - Inscrire une équipe à un tournoi
    """
    queryset = Tournoi.objects.all()
    serializer_class = TournoiSerializer
    # Seuls les organisateurs peuvent créer/modifier/supprimer
    permission_classes = [IsOrganisateurOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Tournoi.objects.filter(statut='planifie')

        if user.role == 'administrateur':
            return Tournoi.objects.all()
        elif user.role == 'organisateur':
            # S'assurer que l'organisateur a un profil Organisateur lié
            try:
                # Accès direct si la relation est nommée 'organisateur'
                organisateur_profile = user.organisateur
                return Tournoi.objects.filter(organisateur=organisateur_profile)
            except Organisateur.DoesNotExist:  # ou user.organisateur.RelatedObjectDoesNotExist
                # Si l'utilisateur avec role='organisateur' n'a pas de profil Organisateur lié
                return Tournoi.objects.none()
        # Pour les joueurs ou autres rôles, on affiche les tournois planifiés/en cours
        return Tournoi.objects.filter(statut__in=['planifie', 'en_cours'])

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type', 'statut', 'organisateur']
    search_fields = ['nom', 'description']

    def perform_create(self, serializer):
        # S'assurer que l'utilisateur est un organisateur et a un profil
        if self.request.user.role == 'organisateur':
            try:
                organisateur_profile = self.request.user.organisateur
                serializer.save(organisateur=organisateur_profile)
            except Organisateur.DoesNotExist:  # ou self.request.user.organisateur.RelatedObjectDoesNotExist
                # Gérer le cas où le profil organisateur n'existe pas
                # Ceci ne devrait pas arriver si la logique de création d'utilisateur est correcte
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(
                    "Profil organisateur non trouvé pour cet utilisateur.")
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Seul un organisateur peut créer un tournoi.")

    @swagger_auto_schema(
        operation_description="Inscrit une équipe à un tournoi",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['equipe_id'],
            properties={
                'equipe_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID de l'équipe à inscrire"),
            }
        ),
        responses={
            201: "Équipe inscrite avec succès",
            400: "Équipe déjà inscrite ou données invalides",
            404: "Équipe non trouvée"
        }
    )
    @action(detail=True, methods=['post'])
    def inscrire_equipe(self, request, pk=None):
        """
        Inscrit une équipe à un tournoi
        """
        tournoi = self.get_object()
        equipe_id = request.data.get('equipe_id')

        try:
            equipe = Equipe.objects.get(id=equipe_id)
            # Vérifier si l'équipe n'est pas déjà inscrite
            if tournoi.rencontre_set.filter(equipe1=equipe).exists() or \
               tournoi.rencontre_set.filter(equipe2=equipe).exists():
                return Response(
                    {"error": "L'équipe est déjà inscrite à ce tournoi"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer une nouvelle rencontre pour l'équipe
            Rencontre.objects.create(
                tournoi=tournoi,
                equipe1=equipe,
                equipe2=None,  # À déterminer plus tard
                statut='planifie'
            )

            return Response(
                {"message": "Équipe inscrite avec succès"},
                status=status.HTTP_201_CREATED
            )
        except Equipe.DoesNotExist:
            return Response(
                {"error": "Équipe non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def changer_statut(self, request, pk=None):
        """
        Change le statut d'un tournoi
        """
        tournoi = self.get_object()
        nouveau_statut = request.data.get('statut')

        if nouveau_statut not in dict(Tournoi.STATUT_CHOICES):
            return Response(
                {"error": "Statut invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        tournoi.statut = nouveau_statut
        tournoi.save()

        return Response(
            {"message": f"Statut du tournoi changé en {nouveau_statut}"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """
        Retourne les statistiques du tournoi
        """
        tournoi = self.get_object()
        equipes = tournoi.rencontre_set.values('equipe1').distinct().count()
        rencontres_terminees = tournoi.rencontre_set.filter(
            statut='termine').count()
        rencontres_total = tournoi.rencontre_set.count()

        return Response({
            'nombre_equipes': equipes,
            'rencontres_terminees': rencontres_terminees,
            'rencontres_total': rencontres_total,
            'progression': f"{rencontres_terminees}/{rencontres_total}"
        })

    @action(detail=True, methods=['post'])
    def generer_rencontres(self, request, pk=None):
        """
        Génère automatiquement les rencontres pour un tournoi
        """
        tournoi = self.get_object()

        if tournoi.statut != 'planifie':
            return Response(
                {"error": "Les rencontres ne peuvent être générées que pour un tournoi planifié"},
                status=status.HTTP_400_BAD_REQUEST
            )

        equipes = list(Equipe.objects.filter(
            id__in=tournoi.rencontre_set.values('equipe1')
        ))

        if len(equipes) < 2:
            return Response(
                {"error": "Il faut au moins 2 équipes pour générer les rencontres"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Supprimer les anciennes rencontres
        tournoi.rencontre_set.all().delete()

        # Générer les nouvelles rencontres selon le type de tournoi
        if tournoi.type == 'elimination':
            # Tournoi à élimination directe
            from random import shuffle
            shuffle(equipes)

            for i in range(0, len(equipes)-1, 2):
                Rencontre.objects.create(
                    tournoi=tournoi,
                    equipe1=equipes[i],
                    equipe2=equipes[i+1],
                    statut='planifie'
                )

        elif tournoi.type == 'round-robin':
            # Tournoi tous contre tous
            for i in range(len(equipes)):
                for j in range(i+1, len(equipes)):
                    Rencontre.objects.create(
                        tournoi=tournoi,
                        equipe1=equipes[i],
                        equipe2=equipes[j],
                        statut='planifie'
                    )

        tournoi.statut = 'en_cours'
        tournoi.save()

        return Response(
            {"message": "Rencontres générées avec succès"},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def mes_tournois(self, request):
        """
        Récupère les tournois auxquels l'utilisateur est inscrit
        """
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Récupérer les inscriptions du joueur
        inscriptions = InscriptionTournoi.objects.filter(joueur=request.user.joueur_profile)
        
        # Récupérer les tournois associés
        tournois = [inscription.tournoi for inscription in inscriptions]

        serializer = self.get_serializer(tournois, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def inscrire_joueur(self, request):
        """
        Inscrit un joueur à un tournoi
        """
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role != 'joueur':
            return Response(
                {"detail": "Seuls les joueurs peuvent s'inscrire à un tournoi"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Récupérer les données du formulaire
        tournoi_id = request.data.get('tournoi_id')
        jeu = request.data.get('jeu')
        pseudo = request.data.get('pseudo')
        niveau = request.data.get('niveau')
        experience = request.data.get('experience')
        equipe = request.data.get('equipe')
        commentaire = request.data.get('commentaire')

        if not all([tournoi_id, jeu, pseudo, niveau, experience]):
            return Response(
                {"detail": "Tous les champs obligatoires doivent être remplis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            joueur = request.user.joueur_profile
            tournoi = Tournoi.objects.get(id=tournoi_id)
            
            # Vérifier si le joueur est déjà inscrit
            if InscriptionTournoi.objects.filter(tournoi=tournoi, joueur=joueur).exists():
                return Response(
                    {"detail": "Vous êtes déjà inscrit à ce tournoi"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer ou récupérer l'équipe
            equipe_obj = None
            if equipe:
                equipe_obj, created = Equipe.objects.get_or_create(
                    nom=equipe,
                    defaults={'organisateur': tournoi.organisateur}
                )

            # Créer l'inscription
            inscription = InscriptionTournoi.objects.create(
                tournoi=tournoi,
                joueur=joueur,
                jeu=jeu,
                pseudo=pseudo,
                niveau=niveau,
                experience=experience,
                equipe=equipe_obj,
                commentaire=commentaire,
                statut='en_attente'
            )

            return Response({
                "message": "Inscription au tournoi réussie",
                "inscription_id": inscription.id
            }, status=status.HTTP_201_CREATED)

        except Tournoi.DoesNotExist:
            return Response(
                {"detail": "Tournoi non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RencontreViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les rencontres

    Permet de :
    - Lister toutes les rencontres
    - Créer une nouvelle rencontre (arbitre uniquement)
    - Récupérer les détails d'une rencontre
    - Mettre à jour une rencontre (arbitre uniquement)
    - Supprimer une rencontre (arbitre uniquement)
    - Valider les scores d'une rencontre
    """
    queryset = Rencontre.objects.all()
    serializer_class = RencontreSerializer
    permission_classes = [IsArbitreOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tournoi', 'statut', 'equipe1', 'equipe2']

    @swagger_auto_schema(
        operation_description="Valide les scores d'une rencontre",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['score1', 'score2'],
            properties={
                'score1': openapi.Schema(type=openapi.TYPE_INTEGER, description="Score de l'équipe 1"),
                'score2': openapi.Schema(type=openapi.TYPE_INTEGER, description="Score de l'équipe 2"),
            }
        ),
        responses={
            200: "Scores validés avec succès",
            400: "Scores manquants ou invalides"
        }
    )
    @action(detail=True, methods=['post'])
    def valider_score(self, request, pk=None):
        """
        Valide les scores d'une rencontre
        """
        rencontre = self.get_object()
        score1 = request.data.get('score1')
        score2 = request.data.get('score2')

        if not score1 or not score2:
            return Response(
                {"error": "Les deux scores sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        rencontre.score1 = score1
        rencontre.score2 = score2
        rencontre.statut = 'termine'
        rencontre.save()

        return Response(
            {"message": "Score validé avec succès"},
            status=status.HTTP_200_OK
        )


class RegisterAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("Données reçues:", request.data)  # Log des données reçues
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Log des données validées
            print("Données valides:", serializer.validated_data)
            try:
                user = serializer.save()
                # Log de la création réussie
                print("Utilisateur créé:", user.email)
                return Response({
                    "user": UserSerializer(user).data,
                    "message": "Utilisateur créé avec succès"
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Erreur lors de la création:", str(e))  # Log des erreurs
                return Response({
                    "error": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Log des erreurs de validation
        print("Erreurs de validation:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        print('Tentative de login avec:', email)
        if not email or not password:
            return Response({'error': 'Email et mot de passe requis'}, status=status.HTTP_400_BAD_REQUEST)
        User = get_user_model()
        try:
            user_exists = User.objects.get(email=email)
        except User.DoesNotExist:
            print(f"Login attempt: User with email {email} not found.")
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        else:
            # User exists, so password must be incorrect
            print(f"Login attempt: Incorrect password for user {email}.")
            return Response({'error': 'Mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all().order_by('-date_creation')
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DashboardAdminView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        # Récupérer les statistiques
        total_joueurs = Joueur.objects.count()
        total_organisateurs = Organisateur.objects.count()
        total_tournois = Tournoi.objects.count()
        total_equipes = Equipe.objects.count()

        # Récupérer les tournois actifs
        tournois_actifs = Tournoi.objects.filter(statut='en_cours')[:5]

        # Récupérer les derniers joueurs inscrits
        derniers_joueurs = Joueur.objects.order_by(
            '-utilisateur__date_inscription')[:5]

        # Récupérer les derniers organisateurs
        derniers_organisateurs = Organisateur.objects.order_by(
            '-utilisateur__date_inscription')[:5]

        # Récupérer les derniers paiements
        derniers_paiements = Paiement.objects.order_by('-date_paiement')[:5]

        data = {
            'total_joueurs': total_joueurs,
            'total_organisateurs': total_organisateurs,
            'total_tournois': total_tournois,
            'total_equipes': total_equipes,
            'tournois_actifs': TournoiSerializer(tournois_actifs, many=True).data,
            'derniers_joueurs': JoueurSerializer(derniers_joueurs, many=True).data,
            'derniers_organisateurs': OrganisateurSerializer(derniers_organisateurs, many=True).data,
            'derniers_paiements': PaiementSerializer(derniers_paiements, many=True).data,
        }

        serializer = DashboardAdminSerializer(data)
        return Response(serializer.data)
