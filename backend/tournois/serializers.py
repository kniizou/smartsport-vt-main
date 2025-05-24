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
    Arbitre, Paiement, Equipe, JoueurEquipe, Tournoi, Rencontre, FAQ
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.CharField(required=True)
    username = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')

    def validate_email(self, value):
        print("Validation de l'email (permissive):", value)
        if '@' not in value:
            raise serializers.ValidationError("Format d'email invalide (doit contenir un @)")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé")
        return value

    def validate_username(self, value):
        print("Validation du username:", value)
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris")
        return value

    def create(self, validated_data):
        print("Création de l'utilisateur avec les données:", validated_data)
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=validated_data.get('role', 'joueur')
            )
            print("Utilisateur créé avec succès:", user.email)
            return user
        except Exception as e:
            print("Erreur lors de la création:", str(e))
            raise


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telephone', 'role', 'date_inscription']
        read_only_fields = ['date_inscription']


class JoueurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)

    class Meta:
        model = Joueur
        fields = ['id', 'utilisateur', 'niveau', 'classement']


class OrganisateurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)

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
        fields = ['id', 'joueur', 'montant', 'date_paiement', 'methode', 'statut']
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
        fields = ['id', 'question', 'answer', 'category', 'date_creation', 'date_modification', 'est_active', 'created_by']
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
