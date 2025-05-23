from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
# Importez les modèles nécessaires
from .models import Joueur, Organisateur, Arbitre, Utilisateur, Paiement, Equipe, JoueurEquipe, Tournoi, Rencontre, FAQ
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
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
User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'administrateur'


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


class JoueurViewSet(viewsets.ModelViewSet):
    queryset = Joueur.objects.all()
    serializer_class = JoueurSerializer
    permission_classes = [permissions.IsAuthenticated]
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
    permission_classes = [IsOrganisateurOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type', 'statut', 'organisateur']
    search_fields = ['nom', 'description']

    def perform_create(self, serializer):
        serializer.save(organisateur=self.request.user.organisateur_profile)

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
