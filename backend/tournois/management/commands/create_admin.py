from django.core.management.base import BaseCommand
from django.db.models import Q  # Ajout de l'importation de Q
from tournois.models import Utilisateur, Administrateur


class Command(BaseCommand):
    help = 'Creates the admin user'

    def handle(self, *args, **kwargs):
        # Delete existing admin users more robustly
        # First, delete any Administrateur profile linked to users that might be deleted
        # This avoids issues if the Administrateur model has a foreign key to Utilisateur
        # that might prevent deletion of Utilisateur if Administrateur is not deleted first.
        # However, the current Administrateur model uses a OneToOneField with primary_key=True,
        # so deleting the Utilisateur should cascade. But being explicit can be safer.

        # Find users that are admins by username or email to ensure all potential old admin accounts are cleared
        potential_admin_users = Utilisateur.objects.filter(
            Q(username='admin') | Q(email='admin@admin.com')
        )

        for user in potential_admin_users:
            # If there's a related Administrateur object, delete it first
            # (though with OneToOneField(primary_key=True) on Administrateur.utilisateur,
            # deleting the Utilisateur should also delete the Administrateur profile due to CASCADE)
            if hasattr(user, 'administrateur') and user.administrateur is not None:
                self.stdout.write(self.style.WARNING(
                    f"Deleting existing Administrateur profile for {user.username}"))
                user.administrateur.delete()

            self.stdout.write(self.style.WARNING(
                f"Deleting existing Utilisateur: {user.username} ({user.email})"))
            user.delete()

        # Create new admin user
        self.stdout.write(self.style.SUCCESS(
            "Attempting to create new admin user..."))
        admin_user = Utilisateur.objects.create_superuser(
            username='admin',
            email='admin@admin.com',
            password='admin2025',
            role='administrateur'
        )

        # Create administrator profile
        Administrateur.objects.create(utilisateur=admin_user)

        self.stdout.write(self.style.SUCCESS(
            'Successfully created admin user'))
