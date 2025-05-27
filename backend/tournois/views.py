from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.contrib.auth import get_user_model, authenticate
# Importez les modèles nécessaires
from .models import Joueur, Organisateur, Arbitre, Utilisateur, Paiement, Equipe, JoueurEquipe, Tournoi, Rencontre, FAQ, InscriptionTournoi
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    UtilisateurSerializer, JoueurSerializer, OrganisateurSerializer,
    ArbitreSerializer, PaiementSerializer, EquipeSerializer,
    JoueurEquipeSerializer, TournoiSerializer, RencontreSerializer, RegisterSerializer, UserSerializer,
    InscriptionTournoiSerializer
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import FAQSerializer
from .serializers import DashboardAdminSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated
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
        # Autoriser organisateur ET administrateur
        return request.user and request.user.role in ['organisateur', 'administrateur']


class IsArbitreOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'arbitre'


class IsJoueurOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'joueur'


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

    def get_permissions(self):
        if self.action == 'inscrire_joueur':
            return [IsJoueurOrReadOnly()]
        return super().get_permissions()

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
        Récupère les tournois selon le rôle de l'utilisateur :
        - Pour les joueurs : les tournois auxquels ils sont inscrits
        - Pour les organisateurs : les tournois qu'ils ont créés
        """
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role == 'organisateur':
            try:
                organisateur_profile = request.user.organisateur
                tournois = Tournoi.objects.filter(organisateur=organisateur_profile)
                serializer = self.get_serializer(tournois, many=True, context={'request': request})
                return Response(serializer.data)
            except Organisateur.DoesNotExist:
                return Response(
                    {"detail": "Profil organisateur non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif request.user.role == 'joueur':
            try:
                joueur = Joueur.objects.get(utilisateur=request.user)
                inscriptions = InscriptionTournoi.objects.filter(joueur=joueur)
                tournois = [inscription.tournoi for inscription in inscriptions]
                serializer = self.get_serializer(tournois, many=True, context={'request': request})
                return Response(serializer.data)
            except Joueur.DoesNotExist:
                return Response(
                    {"detail": "Profil joueur non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"detail": "Accès non autorisé"},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=True, methods=['post'])
    def inscrire_joueur(self, request, pk=None):
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
        jeu = request.data.get('jeu')
        pseudo = request.data.get('pseudo')
        niveau = request.data.get('niveau')
        experience = request.data.get('experience')
        equipe = request.data.get('equipe')
        commentaire = request.data.get('commentaire')

        if not all([jeu, pseudo, niveau, experience]):
            return Response(
                {"detail": "Tous les champs obligatoires doivent être remplis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Récupérer ou créer le profil joueur
            joueur = Joueur.objects.filter(utilisateur=request.user).first()
            if not joueur:
                joueur = Joueur.objects.create(
                    utilisateur=request.user,
                    niveau=niveau,
                    experience=experience
                )

            tournoi = self.get_object()
            
            # Vérifier si le tournoi est ouvert aux inscriptions
            if tournoi.statut != 'planifie':
                return Response(
                    {"detail": "Ce tournoi n'est plus ouvert aux inscriptions"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier si le joueur est déjà inscrit à ce tournoi spécifique
            inscription_existante = InscriptionTournoi.objects.filter(
                tournoi=tournoi,
                joueur=joueur
            ).first()

            if inscription_existante:
                if inscription_existante.statut == 'en_attente':
                    return Response(
                        {"detail": "Vous avez déjà une inscription en attente pour ce tournoi"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif inscription_existante.statut == 'validee':
                    return Response(
                        {"detail": "Vous êtes déjà inscrit à ce tournoi"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif inscription_existante.statut == 'refusee':
                    # Si l'inscription précédente a été refusée, on peut créer une nouvelle inscription
                    inscription_existante.delete()

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
                "inscription_id": inscription.id,
                "statut": "en_attente",
                "tournoi": {
                    "id": tournoi.id,
                    "nom": tournoi.nom,
                    "date_debut": tournoi.date_debut,
                    "date_fin": tournoi.date_fin,
                    "statut": tournoi.statut
                }
            }, status=status.HTTP_201_CREATED)

        except Tournoi.DoesNotExist:
            return Response(
                {"detail": "Tournoi non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print("Erreur détaillée:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"detail": f"Une erreur est survenue lors de l'inscription: {str(e)}"},
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
        print("Données reçues:", request.data)
        serializer = RegisterSerializer(data=request.data)
        
        try:
            if serializer.is_valid():
                print("Données valides:", serializer.validated_data)
                try:
                    user = serializer.save()
                    print("Utilisateur créé:", user.email)
                    return Response({
                        "user": UserSerializer(user).data,
                        "message": "Utilisateur créé avec succès"
                    }, status=status.HTTP_201_CREATED)
                except serializers.ValidationError as ve:
                    print("Erreur de validation lors de la création:", str(ve))
                    return Response({
                        "error": str(ve),
                        "detail": "Erreur de validation lors de la création de l'utilisateur"
                    }, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    import traceback
                    print("Erreur détaillée lors de la création:", str(e))
                    print("Traceback complet:", traceback.format_exc())
                    if hasattr(e, 'user') and e.user and e.user.id:
                        try:
                            e.user.delete()
                        except Exception as delete_error:
                            print("Erreur lors de la suppression de l'utilisateur:", str(delete_error))
                    return Response({
                        "error": str(e),
                        "detail": "Une erreur est survenue lors de la création de l'utilisateur"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print("Erreurs de validation:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print("Erreur inattendue:", str(e))
            print("Traceback complet:", traceback.format_exc())
            return Response({
                "error": str(e),
                "detail": "Une erreur inattendue est survenue"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("Requête reçue dans DashboardAdminView")
        print("Utilisateur:", request.user)
        print("Est admin:", request.user.is_staff)
        print("Est authentifié:", request.user.is_authenticated)
        print("Rôle:", request.user.role)

        if not request.user.role == 'administrateur':
            print("Accès refusé: utilisateur non admin")
            return Response(
                {"error": "Accès non autorisé. Rôle administrateur requis."},
                status=403
            )

        try:
            # Récupération des statistiques
            total_joueurs = Joueur.objects.count()
            total_organisateurs = Organisateur.objects.count()
            total_tournois = Tournoi.objects.count()
            total_equipes = Equipe.objects.count()

            # Récupération des tournois avec leurs inscriptions et organisateurs
            tournois = Tournoi.objects.all().select_related(
                'organisateur',
                'organisateur__utilisateur'
            ).prefetch_related(
                'inscriptiontournoi_set',
                'inscriptiontournoi_set__joueur',
                'inscriptiontournoi_set__joueur__utilisateur'
            )

            # Récupération des joueurs avec leurs inscriptions
            joueurs = Joueur.objects.all().select_related(
                'utilisateur'
            ).prefetch_related(
                'inscriptiontournoi_set',
                'inscriptiontournoi_set__tournoi'
            )

            # Récupération des organisateurs avec leurs tournois
            organisateurs = Organisateur.objects.all().select_related(
                'utilisateur'
            ).prefetch_related(
                'tournoi_set'
            )

            # Sérialisation des données
            tournois_data = []
            for tournoi in tournois:
                tournoi_dict = TournoiSerializer(tournoi).data
                tournoi_dict['inscriptions'] = InscriptionTournoiSerializer(
                    tournoi.inscriptiontournoi_set.all(),
                    many=True
                ).data
                tournois_data.append(tournoi_dict)

            joueurs_data = []
            for joueur in joueurs:
                joueur_dict = JoueurSerializer(joueur).data
                joueur_dict['inscriptions'] = InscriptionTournoiSerializer(
                    joueur.inscriptiontournoi_set.all(),
                    many=True
                ).data
                joueurs_data.append(joueur_dict)

            organisateurs_data = []
            for organisateur in organisateurs:
                organisateur_dict = OrganisateurSerializer(organisateur).data
                organisateur_dict['tournois'] = TournoiSerializer(
                    organisateur.tournoi_set.all(),
                    many=True
                ).data
                organisateurs_data.append(organisateur_dict)

            response_data = {
                "total_joueurs": total_joueurs,
                "total_organisateurs": total_organisateurs,
                "total_tournois": total_tournois,
                "total_equipes": total_equipes,
                "tournois": tournois_data,
                "joueurs": joueurs_data,
                "organisateurs": organisateurs_data
            }

            print("Données envoyées au frontend:", response_data)
            return Response(response_data)

        except Exception as e:
            print("Erreur lors de la récupération des données:", str(e))
            return Response(
                {"error": f"Erreur lors de la récupération des données: {str(e)}"},
                status=500
            )


class InscriptionTournoiViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les inscriptions aux tournois

    Permet de :
    - Lister les inscriptions (filtrées par organisateur)
    - Valider/refuser une inscription (organisateur uniquement)
    - Voir les détails d'une inscription
    """
    queryset = InscriptionTournoi.objects.all()
    serializer_class = InscriptionTournoiSerializer
    permission_classes = [IsOrganisateurOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return InscriptionTournoi.objects.none()

        if user.role == 'administrateur':
            return InscriptionTournoi.objects.all()
        elif user.role == 'organisateur':
            try:
                organisateur_profile = user.organisateur
                return InscriptionTournoi.objects.filter(tournoi__organisateur=organisateur_profile)
            except Organisateur.DoesNotExist:
                return InscriptionTournoi.objects.none()
        elif user.role == 'joueur':
            try:
                joueur = Joueur.objects.get(utilisateur=user)
                return InscriptionTournoi.objects.filter(joueur=joueur)
            except Joueur.DoesNotExist:
                return InscriptionTournoi.objects.none()
        return InscriptionTournoi.objects.none()

    def update(self, request, *args, **kwargs):
        if request.user.role != 'organisateur':
            return Response(
                {"detail": "Seuls les organisateurs peuvent modifier le statut des inscriptions"},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        if instance.tournoi.organisateur != request.user.organisateur:
            return Response(
                {"detail": "Vous n'êtes pas l'organisateur de ce tournoi"},
                status=status.HTTP_403_FORBIDDEN
            )

        if 'statut' not in request.data:
            return Response(
                {"detail": "Le statut est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        nouveau_statut = request.data['statut']
        if nouveau_statut not in ['validee', 'refusee']:
            return Response(
                {"detail": "Statut invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mettre à jour le statut
        instance.statut = nouveau_statut
        instance.save()

        # Si l'inscription est validée, mettre à jour le nombre d'équipes inscrites
        if nouveau_statut == 'validee':
            try:
                tournoi = instance.tournoi
                tournoi.registeredTeams = (tournoi.registeredTeams or 0) + 1
                tournoi.save()
            except Exception as e:
                print(f"Erreur lors de la mise à jour du nombre d'équipes: {str(e)}")

        # Envoyer une notification au joueur (à implémenter si nécessaire)
        # TODO: Ajouter un système de notification

        return Response(
            {
                "message": f"Inscription {nouveau_statut} avec succès",
                "inscription": self.get_serializer(instance).data
            },
            status=status.HTTP_200_OK
        )
