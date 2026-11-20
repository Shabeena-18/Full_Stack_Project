from django.db import models
from django.contrib.auth.models import User
from menu.models import FoodItem


class Order(models.Model):
    """
    A placed order. Total amount is always calculated on the server
    (never trusted from the browser) at checkout time.
    """

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Preparing', 'Preparing'),
        ('Ready', 'Ready'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    PAYMENT_CHOICES = (
        ('COD', 'Cash on Delivery'),
        ('DEMO', 'Demo Payment'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    order_notes = models.CharField(max_length=255, blank=True)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=40)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='COD')

    # Whoever from the delivery team is handling this order.
    handled_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='handled_orders'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #FP{1000 + self.id}"

    @property
    def order_number(self):
        return f"FP{1000 + self.id}"

    # The happy path an order follows; the React app draws its tracking
    # timeline from this list.
    STATUS_ORDER = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']

    # Which status a delivery staff member moves an order to next.
    NEXT_STATUS = {
        'Pending': 'Accepted',
        'Accepted': 'Preparing',
        'Preparing': 'Ready',
        'Ready': 'Out for Delivery',
        'Out for Delivery': 'Delivered',
    }

    @property
    def status_step(self):
        try:
            return self.STATUS_ORDER.index(self.status)
        except ValueError:
            return -1

    @property
    def next_status(self):
        return self.NEXT_STATUS.get(self.status)


class OrderItem(models.Model):
    """
    One line item inside an order.
    IMPORTANT: price is copied from FoodItem at the moment the order is
    placed, so it never changes even if the restaurant updates the menu
    price later.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    food_item = models.ForeignKey(FoodItem, on_delete=models.SET_NULL, null=True)
    food_name = models.CharField(max_length=150)  # snapshot, survives food deletion
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # price at order time

    @property
    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.food_name} x {self.quantity} (Order #FP{1000 + self.order_id})"
