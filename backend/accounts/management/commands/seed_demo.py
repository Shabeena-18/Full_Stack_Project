from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand

DEMO_USERS = [
    # username, password, is_superuser, role
    ('admin', 'admin12345', True, 'customer'),
    ('delivery1', 'delivery12345', False, 'delivery'),
]


class Command(BaseCommand):
    help = 'Create the demo admin + delivery accounts and load the sample menu.'

    def handle(self, *args, **options):
        for username, password, is_superuser, role in DEMO_USERS:
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(password)
                user.is_staff = user.is_superuser = is_superuser
                user.save()
            profile = user.profile
            profile.role = role
            profile.save()
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {username} ({role})")

        call_command('populate_food', stdout=self.stdout)
        self.stdout.write(self.style.SUCCESS('Demo data ready.'))
