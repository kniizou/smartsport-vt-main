from django.contrib.auth.hashers import make_password
from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class Utilisateur(AbstractUser):
    ROLE_CHOICES = [
        ('joueur', 'Joueur'),
        ('organisateur', 'Organisateur'),
        ('administrateur', 'Administrateur'),
        ('arbitre', 'Arbitre'),
    ]

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    date_inscription = models.DateTimeField(auto_now_add=True)
    supabase_uid = models.CharField(
        max_length=255, unique=True, null=True, blank=True, help_text="Supabase User ID")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    class Meta:
        db_table = 'utilisateur'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_inscription']

    def __str__(self):
        return f"{self.username} ({self.email})"


class Joueur(models.Model):
    NIVEAU_CHOICES = [
        ('debutant', 'Débutant'),
        ('intermediaire', 'Intermédiaire'),
        ('avance', 'Avancé'),
        ('expert', 'Expert'),
    ]

    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'
    )
    niveau = models.CharField(
        max_length=20, choices=NIVEAU_CHOICES, default='debutant')
    classement = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'joueur'
        verbose_name = "Joueur"
        verbose_name_plural = "Joueurs"

    def __str__(self):
        return f"Joueur: {self.utilisateur.username}"


class Organisateur(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'
    )
    nom_organisation = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'organisateur'
        verbose_name = "Organisateur"
        verbose_name_plural = "Organisateurs"

    def __str__(self):
        return f"Organisateur: {self.nom_organisation}"


class Administrateur(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'
    )

    class Meta:
        db_table = 'administrateur'
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"

    def __str__(self):
        return f"Admin: {self.utilisateur.username}"


class Arbitre(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'
    )

    class Meta:
        db_table = 'arbitre'
        verbose_name = "Arbitre"
        verbose_name_plural = "Arbitres"

    def __str__(self):
        return f"Arbitre: {self.utilisateur.username}"


class Paiement(models.Model):
    METHODE_CHOICES = [
        ('carte', 'Carte bancaire'),
        ('virement', 'Virement bancaire'),
        ('especes', 'Espèces'),
        ('autre', 'Autre'),
    ]
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('paye', 'Payé'),
        ('refuse', 'Refusé'),
        ('rembourse', 'Remboursé'),
    ]

    joueur = models.ForeignKey(
        Joueur,
        on_delete=models.PROTECT,
        db_column='joueur_id'
    )
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    date_paiement = models.DateTimeField(auto_now_add=True)
    methode = models.CharField(max_length=20, choices=METHODE_CHOICES)
    statut = models.CharField(
        max_length=20, choices=STATUT_CHOICES, default='en_attente')

    class Meta:
        db_table = 'paiement'
        ordering = ['-date_paiement']

    def __str__(self):
        return f"Paiement #{self.id} - {self.montant}€"


class Equipe(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    organisateur = models.ForeignKey(
        Organisateur,
        on_delete=models.CASCADE,
        db_column='organisateur_id'
    )

    class Meta:
        db_table = 'equipe'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class JoueurEquipe(models.Model):
    ROLE_CHOICES = [
        ('capitaine', 'Capitaine'),
        ('membre', 'Membre'),
        ('remplacant', 'Remplaçant'),
    ]

    joueur = models.ForeignKey(
        Joueur,
        on_delete=models.CASCADE,
        db_column='joueur_id'
    )
    equipe = models.ForeignKey(
        Equipe,
        on_delete=models.CASCADE,
        db_column='equipe_id'
    )
    date_ajout = models.DateTimeField(auto_now_add=True)
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='membre')

    class Meta:
        db_table = 'joueurequipe'
        constraints = [
            UniqueConstraint(
                fields=['joueur', 'equipe'],
                name='unique_joueur_equipe'
            )
        ]

    def __str__(self):
        return f"{self.joueur} dans {self.equipe}"


class Tournoi(models.Model):
    TYPE_CHOICES = [
        ('elimination', 'Élimination simple'),
        ('round-robin', 'Round Robin'),
        ('mixte', 'Format mixte'),
    ]
    STATUT_CHOICES = [
        ('planifie', 'Planifié'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    ]

    nom = models.CharField(max_length=100)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    regles = models.TextField(blank=True)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    prix_inscription = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    statut = models.CharField(
        max_length=20, choices=STATUT_CHOICES, default='planifie')
    organisateur = models.ForeignKey(
        Organisateur,
        on_delete=models.CASCADE,
        db_column='organisateur_id'
    )

    class Meta:
        db_table = 'tournoi'
        constraints = [
            CheckConstraint(
                check=Q(date_fin__gt=models.F('date_debut')),
                name='check_date_fin_apres_debut'
            )
        ]

    def __str__(self):
        return self.nom


class Rencontre(models.Model):
    STATUT_CHOICES = [
        ('planifie', 'Planifié'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
        ('reporte', 'Reporté'),
    ]

    tournoi = models.ForeignKey(
        Tournoi,
        on_delete=models.CASCADE,
        db_column='tournoi_id'
    )
    nom = models.CharField(max_length=100, blank=True)
    date_heure = models.DateTimeField()
    duree = models.PositiveIntegerField(
        help_text="Durée en minutes", null=True, blank=True)
    score1 = models.IntegerField(null=True, blank=True)
    score2 = models.IntegerField(null=True, blank=True)
    statut = models.CharField(
        max_length=20, choices=STATUT_CHOICES, default='planifie')
    equipe1 = models.ForeignKey(
        Equipe,
        on_delete=models.CASCADE,
        related_name='rencontres_equipe1',
        db_column='equipe1_id'
    )
    equipe2 = models.ForeignKey(
        Equipe,
        on_delete=models.CASCADE,
        related_name='rencontres_equipe2',
        db_column='equipe2_id'
    )
    arbitre = models.ForeignKey(
        Arbitre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='arbitre_id'
    )
    terrain = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'rencontre'
        constraints = [
            CheckConstraint(
                check=~Q(equipe1=models.F('equipe2')),
                name='check_equipes_differentes'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.nom:
            self.nom = f"{self.equipe1} vs {self.equipe2}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.equipe1} vs {self.equipe2}"


class CategorieFAQ(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    ordre = models.IntegerField(default=0)

    class Meta:
        db_table = 'categorie_faq'
        verbose_name = "Catégorie FAQ"
        verbose_name_plural = "Catégories FAQ"
        ordering = ['ordre', 'nom']

    def __str__(self):
        return self.nom


class FAQ(models.Model):
    question = models.CharField(max_length=200)
    reponse = models.TextField()
    categorie = models.ForeignKey(
        CategorieFAQ,
        on_delete=models.CASCADE,
        related_name='faqs',
        db_column='categorie_id'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    est_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'faq'
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"
        ordering = ['categorie', 'question']

    def __str__(self):
        return self.question
