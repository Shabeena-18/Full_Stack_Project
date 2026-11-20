from django.db import models


class FoodItem(models.Model):
    """
    A single dish on the Food Paradise menu.
    Managed entirely through Django Admin - never hard-coded in HTML.
    """

    CATEGORY_CHOICES = (
        ('Pizza', 'Pizza'),
        ('Burger', 'Burger'),
        ('Indian', 'Indian'),
        ('Chinese', 'Chinese'),
        ('Desserts', 'Desserts'),
        ('Drinks', 'Drinks'),
        ('Snacks', 'Snacks'),
        ('Healthy', 'Healthy'),
    )

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)
    # Fallback image URL, used when no local image file has been uploaded.
    image_url = models.URLField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Snacks')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def display_image(self):
        """Return uploaded image if present, otherwise the fallback URL."""
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        return ''
