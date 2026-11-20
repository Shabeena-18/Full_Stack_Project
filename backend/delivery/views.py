from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsDeliveryStaff
from orders.models import Order
from orders.serializers import OrderSerializer

FINISHED_STATUSES = ['Delivered', 'Cancelled']


class DashboardView(APIView):
    """
    GET /api/delivery/orders/
    Every order that still needs attention (newest first), plus the ten
    most recently finished ones.
    """

    permission_classes = [IsDeliveryStaff]

    def get(self, request):
        active = Order.objects.exclude(status__in=FINISHED_STATUSES).prefetch_related('items')
        completed = Order.objects.filter(status__in=FINISHED_STATUSES).prefetch_related('items')[:10]
        return Response({
            'active': OrderSerializer(active, many=True).data,
            'completed': OrderSerializer(completed, many=True).data,
        })


class AdvanceStatusView(APIView):
    """POST /api/delivery/orders/<id>/advance/ - move to the next status."""

    permission_classes = [IsDeliveryStaff]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        new_status = order.next_status
        if new_status is None:
            return Response(
                {'detail': 'This order has no further status to move to.'},
                status=400,
            )
        order.status = new_status
        order.handled_by = request.user
        order.save()
        return Response(OrderSerializer(order).data)


class CancelOrderView(APIView):
    """POST /api/delivery/orders/<id>/cancel/"""

    permission_classes = [IsDeliveryStaff]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        if order.status in FINISHED_STATUSES:
            return Response({'detail': f'A {order.status.lower()} order cannot be cancelled.'}, status=400)
        order.status = 'Cancelled'
        order.handled_by = request.user
        order.save()
        return Response(OrderSerializer(order).data)
