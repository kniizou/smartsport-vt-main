# # tournois/serializers.py
# from rest_framework import serializers
# from .models import *


# class UtilisateurSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Utilisateur
#         fields = ['id', 'email', 'first_name', 'last_name', 'role']


# class JoueurSerializer(serializers.ModelSerializer):
#     utilisateur = UtilisateurSerializer()

#     class Meta:
#         model = Joueur
#         fields = '__all__'


# class TournoiSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Tournoi
#         fields = '__all__'

# # Ajoutez des serializers pour les autres modèles...

# tournois/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Utilisateur, Joueur, Organisateur, Administrateur,
    Arbitre, Paiement, Equipe, JoueurEquipe, Tournoi, Rencontre, FAQ, InscriptionTournoi
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ('username', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        print(f"Validation du username: {value}")
        if Utilisateur.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        print(f"Validation de l'email (permissive): {value}")
        if Utilisateur.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        print("Création de l'utilisateur avec les données:", validated_data)
        try:
            # Créer l'utilisateur
            user = Utilisateur.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                role=validated_data['role']
            )
            print(f"Utilisateur {user.email} créé avec succès avec le rôle {user.role}.")

            try:
                # Créer le profil correspondant au rôle
                if user.role == 'joueur':
                    # Vérifier si un profil joueur existe déjà
                    try:
                        joueur = Joueur.objects.get(utilisateur=user)
                        print(f"Profil joueur existe déjà pour {user.email}")
                        return user
                    except Joueur.DoesNotExist:
                        Joueur.objects.create(utilisateur=user)
                        print(f"Profil joueur créé pour {user.email}")
                elif user.role == 'organisateur':
                    try:
                        organisateur = Organisateur.objects.get(utilisateur=user)
                        print(f"Profil organisateur existe déjà pour {user.email}")
                        return user
                    except Organisateur.DoesNotExist:
                        Organisateur.objects.create(utilisateur=user)
                        print(f"Profil organisateur créé pour {user.email}")
                elif user.role == 'arbitre':
                    try:
                        arbitre = Arbitre.objects.get(utilisateur=user)
                        print(f"Profil arbitre existe déjà pour {user.email}")
                        return user
                    except Arbitre.DoesNotExist:
                        Arbitre.objects.create(utilisateur=user)
                        print(f"Profil arbitre créé pour {user.email}")
                elif user.role == 'administrateur':
                    try:
                        admin = Administrateur.objects.get(utilisateur=user)
                        print(f"Profil administrateur existe déjà pour {user.email}")
                        return user
                    except Administrateur.DoesNotExist:
                        Administrateur.objects.create(utilisateur=user)
                        print(f"Profil administrateur créé pour {user.email}")
                else:
                    raise serializers.ValidationError(f"Rôle invalide: {user.role}")

                return user
            except Exception as profile_error:
                print(f"Erreur lors de la création du profil {user.role}: {str(profile_error)}")
                # Supprimer l'utilisateur si la création du profil échoue
                if user.id:
                    try:
                        user.delete()
                    except Exception as delete_error:
                        print(f"Erreur lors de la suppression de l'utilisateur: {str(delete_error)}")
                raise serializers.ValidationError(f"Erreur lors de la création du profil: {str(profile_error)}")

        except Exception as e:
            print(f"Erreur lors de la création de l'utilisateur: {str(e)}")
            raise serializers.ValidationError(f"Erreur lors de la création de l'utilisateur: {str(e)}")


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'first_name',
                  'last_name', 'telephone', 'role', 'date_inscription']
        read_only_fields = ['date_inscription']


class JoueurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)

    class Meta:
        model = Joueur
        # L'ID du Joueur est l'ID de son champ utilisateur (qui est la clé primaire)
        # 'utilisateur' est déjà sérialisé et contient l'ID de l'utilisateur.
        # Si le frontend s'attend à un champ 'id' au niveau racine de l'objet Joueur,
        # nous devons l'ajouter explicitement.
        fields = ['utilisateur', 'niveau', 'classement']
        # Pour exposer l'ID de l'utilisateur comme l'ID du joueur directement:
        # fields = ['id', 'utilisateur', 'niveau', 'classement']
        # Et ajouter: id = serializers.IntegerField(source='utilisateur.id', read_only=True)
        # Cependant, le frontend utilise déjà joueur.utilisateur.id pour les actions.
        # Pour la key dans le map, il utilise joueur.id.
        # Donc, il est mieux d'ajouter explicitement le champ id.


class JoueurSerializer(serializers.ModelSerializer):  # Redéfinition pour clarté
    utilisateur = UtilisateurSerializer(read_only=True)
    id = serializers.IntegerField(
        source='utilisateur.id', read_only=True)  # Ajout explicite de l'ID

    class Meta:
        model = Joueur
        fields = ['id', 'utilisateur', 'niveau', 'classement']


class OrganisateurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)

    class Meta:
        model = Organisateur
        fields = ['utilisateur', 'nom_organisation', 'description']
        # Même logique que pour JoueurSerializer


# Redéfinition pour clarté
class OrganisateurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    id = serializers.IntegerField(
        source='utilisateur.id', read_only=True)  # Ajout explicite de l'ID

    class Meta:
        model = Organisateur
        fields = ['id', 'utilisateur', 'nom_organisation', 'description']


class ArbitreSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)

    class Meta:
        model = Arbitre
        fields = ['utilisateur']


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'joueur', 'montant',
                  'date_paiement', 'methode', 'statut']
        read_only_fields = ['date_paiement']


class EquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipe
        fields = ['id', 'nom', 'date_creation', 'organisateur']
        read_only_fields = ['date_creation']


class JoueurEquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoueurEquipe
        fields = ['id', 'joueur', 'equipe', 'date_ajout', 'role']
        read_only_fields = ['date_ajout']


class TournoiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournoi
        fields = [
            'id', 'nom', 'description', 'type', 'regles',
            'date_debut', 'date_fin', 'prix_inscription',
            'statut', 'organisateur'
        ]
        read_only_fields = ['organisateur']

    def validate(self, data):
        if data['date_fin'] <= data['date_debut']:
            raise serializers.ValidationError(
                "La date de fin doit être postérieure à la date de début"
            )
        return data


class RencontreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rencontre
        fields = [
            'id', 'tournoi', 'nom', 'date_heure', 'duree',
            'score1', 'score2', 'statut', 'equipe1', 'equipe2',
            'arbitre', 'terrain'
        ]

    def validate(self, data):
        if data['equipe1'] == data['equipe2']:
            raise serializers.ValidationError(
                "Une équipe ne peut pas jouer contre elle-même"
            )
        return data


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'date_creation',
                  'date_modification', 'est_active', 'created_by']
        read_only_fields = ['date_creation', 'date_modification', 'created_by']


class DashboardAdminSerializer(serializers.Serializer):
    total_joueurs = serializers.IntegerField()
    total_organisateurs = serializers.IntegerField()
    total_tournois = serializers.IntegerField()
    total_equipes = serializers.IntegerField()
    tournois_actifs = TournoiSerializer(many=True)
    derniers_joueurs = JoueurSerializer(many=True)
    derniers_organisateurs = OrganisateurSerializer(many=True)
    derniers_paiements = PaiementSerializer(many=True)


class InscriptionTournoiSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscriptionTournoi
        fields = [
            'id', 'tournoi', 'joueur', 'jeu', 'pseudo', 'niveau',
            'experience', 'equipe', 'commentaire', 'statut',
            'date_inscription'
        ]
        read_only_fields = ['joueur', 'statut', 'date_inscription']
