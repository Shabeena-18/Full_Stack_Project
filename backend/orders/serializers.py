from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'food_name', 'quantity', 'price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    """Read-only view of an order, shared by customers and delivery staff."""

    items = OrderItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_step = serializers.IntegerField(read_only=True)
    status_order = serializers.ListField(default=Order.STATUS_ORDER, read_only=True)
    next_status = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'customer_name', 'phone', 'delivery_address',
            'order_notes', 'items', 'delivery_fee', 'total_amount',
            'status', 'status_step', 'status_order', 'next_status',
            'payment_method', 'payment_method_display', 'created_at',
        )
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    """Delivery details submitted at checkout. Prices are NOT accepted from the client."""

    customer_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    delivery_address = serializers.CharField()
    order_notes = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES, default='COD')
