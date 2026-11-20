from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from menu.models import FoodItem
from .models import Cart, CartItem
from .serializers import AddToCartSerializer, CartSerializer, UpdateQuantitySerializer


def cart_response(request, http_status=status.HTTP_200_OK):
    """Serialize the caller's current cart (creating it on first use)."""
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return Response(CartSerializer(cart, context={'request': request}).data, status=http_status)


class CartView(APIView):
    """
    GET    /api/cart/   -> the cart, its items and totals
    DELETE /api/cart/   -> clear the cart
    """

    def get(self, request):
        return cart_response(request)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return cart_response(request)


class CartItemListView(APIView):
    """
    POST /api/cart/items/   {"food_id": 3}
    Adds a dish. If it is already in the cart the quantity goes up by one
    instead of creating a duplicate row.
    """

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        food_item = get_object_or_404(FoodItem, id=serializer.validated_data['food_id'])
        if not food_item.is_available:
            return Response(
                {'detail': 'This item is currently unavailable.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, food_item=food_item)
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        return cart_response(request, status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """
    PATCH  /api/cart/items/<id>/   {"quantity": 3}   (0 removes the item)
    DELETE /api/cart/items/<id>/                     remove the item
    Users can only touch items in their own cart.
    """

    def get_item(self, request, item_id):
        return get_object_or_404(CartItem, id=item_id, cart__user=request.user)

    def patch(self, request, item_id):
        item = self.get_item(request, item_id)
        serializer = UpdateQuantitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data['quantity']
        if quantity == 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        return cart_response(request)

    def delete(self, request, item_id):
        self.get_item(request, item_id).delete()
        return cart_response(request)
