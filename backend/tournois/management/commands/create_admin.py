from django.core.management.base import BaseCommand
from tournois.models import Utilisateur, Administrateur

class Command(BaseCommand):
    help = 'Creates the admin user'

    def handle(self, *args, **kwargs):
        # Delete existing admin users
        Administrateur.objects.all().delete()
        Utilisateur.objects.filter(email='admin@admin.com').delete()

        # Create new admin user
        admin_user = Utilisateur.objects.create_superuser(
            username='admin',
            email='admin@admin.com',
            password='admin2025',
            role='administrateur'
        )

        # Create administrator profile
        Administrateur.objects.create(utilisateur=admin_user)

        self.stdout.write(self.style.SUCCESS('Successfully created admin user')) 