from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from menu.serializers import FoodItemSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    food_item = FoodItemSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'food_item', 'quantity', 'subtotal')


class CartSerializer(serializers.ModelSerializer):
    """The whole cart with totals, so the frontend never does price maths."""

    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(source='total_price', max_digits=10, decimal_places=2, read_only=True)
    delivery_fee = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('items', 'total_items', 'subtotal', 'delivery_fee', 'grand_total')

    # Money is always sent as a "123.00" string, like every other price field.
    def _delivery_fee(self, cart):
        return Decimal(settings.DELIVERY_FEE) if cart.total_items else Decimal(0)

    def get_delivery_fee(self, cart):
        return f'{self._delivery_fee(cart):.2f}'

    def get_grand_total(self, cart):
        return f'{cart.total_price + self._delivery_fee(cart):.2f}'


class AddToCartSerializer(serializers.Serializer):
    food_id = serializers.IntegerField()


class UpdateQuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)
