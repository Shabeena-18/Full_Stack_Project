from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    """
    Extra information about a user that Django's built-in User model
    does not have, such as a phone number and a "role".

    Role is how we tell customers, delivery staff and admins apart:
        customer -> can browse menu, use cart, place orders
        delivery -> can see and update orders on the delivery dashboard
        admin    -> full access via Django Admin (is_staff/is_superuser)
    """

    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('delivery', 'Delivery Staff'),
        ('admin', 'Admin'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    @property
    def is_delivery_staff(self):
        """Delivery staff, plus superusers (handy during demos)."""
        return self.role == 'delivery' or self.user.is_superuser


@receiver(post_save, sender=User)
def create_or_update_profile(sender, instance, created, **kwargs):
    """
    Automatically create a Profile whenever a new User is created.
    This runs behind the scenes so beginners don't have to remember
    to create a profile manually every time.
    """
    if created:
        Profile.objects.create(user=instance)
    else:
        # Make sure older users (e.g. created via createsuperuser) still
        # have a profile object to avoid errors elsewhere in the app.
        Profile.objects.get_or_create(user=instance)
