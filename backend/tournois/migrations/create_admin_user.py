from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_admin_user(apps, schema_editor):
    Utilisateur = apps.get_model('tournois', 'Utilisateur')
    Administrateur = apps.get_model('tournois', 'Administrateur')

    # Supprimer tous les administrateurs existants
    Administrateur.objects.all().delete()

    # Créer l'administrateur unique
    admin_user = Utilisateur.objects.create(
        username='kenza',
        email='admin@gmail.com',
        password=make_password('admin2025'),
        role='administrateur',
        is_staff=True,
        is_superuser=True
    )

    Administrateur.objects.create(utilisateur=admin_user)


def reverse_admin_user(apps, schema_editor):
    Utilisateur = apps.get_model('tournois', 'Utilisateur')
    Utilisateur.objects.filter(email='admin@admin.com').delete()


class Migration(migrations.Migration):
    dependencies = [
        # Assurez-vous que ceci pointe vers votre dernière migration
        ('tournois', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_admin_user),
    ]
