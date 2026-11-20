from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from .models import Order, OrderItem
from .serializers import CheckoutSerializer, OrderSerializer


class OrderListCreateView(APIView):
    """
    GET  /api/orders/   -> the logged-in customer's orders, newest first
    POST /api/orders/   -> checkout: turn the cart into an order
    """

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_items = list(cart.items.select_related('food_item'))
        if not cart_items:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # The total is always recalculated here on the server - a price sent
        # from the browser would have no effect.
        delivery_fee = settings.DELIVERY_FEE
        grand_total = cart.total_price + delivery_fee

        # One transaction so we never end up with a half-saved order.
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                customer_name=data['customer_name'],
                phone=data['phone'],
                delivery_address=data['delivery_address'],
                order_notes=data['order_notes'],
                total_amount=grand_total,
                delivery_fee=delivery_fee,
                payment_method=data['payment_method'],
                status='Pending',
            )
            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    food_item=item.food_item,
                    food_name=item.food_item.name,
                    quantity=item.quantity,
                    price=item.food_item.price,  # snapshot of the price right now
                )
                for item in cart_items
            ])
            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(RetrieveAPIView):
    """GET /api/orders/<id>/ - a customer can only read their own orders."""

    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')
