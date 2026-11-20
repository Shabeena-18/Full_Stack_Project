from django.db import models
from django.contrib.auth.models import User
from menu.models import FoodItem


class Cart(models.Model):
    """
    Every user has exactly one Cart (created automatically the first
    time they add an item). The Cart itself just groups CartItems.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    """
    One food item inside a cart, with a quantity.
    A unique_together constraint makes sure the same food item is never
    duplicated in the same cart - adding it again just increases quantity.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'food_item')

    def __str__(self):
        return f"{self.food_item.name} x {self.quantity}"

    @property
    def subtotal(self):
        return self.food_item.price * self.quantity
