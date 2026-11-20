from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import FoodItem
from .serializers import FoodItemSerializer


class MenuListView(ListAPIView):
    """
    GET /api/menu/                        -> every available dish
    GET /api/menu/?category=Pizza         -> filter by category
    GET /api/menu/?search=burger          -> search by name
    """

    permission_classes = [AllowAny]
    serializer_class = FoodItemSerializer
    pagination_class = None

    def get_queryset(self):
        foods = FoodItem.objects.filter(is_available=True)

        category = self.request.query_params.get('category', 'All')
        if category and category != 'All':
            foods = foods.filter(category=category)

        search = self.request.query_params.get('search', '').strip()
        if search:
            foods = foods.filter(name__icontains=search)
        return foods


class PopularDishesView(ListAPIView):
    """GET /api/menu/popular/ - the handful of dishes shown on the home page."""

    permission_classes = [AllowAny]
    serializer_class = FoodItemSerializer
    pagination_class = None

    def get_queryset(self):
        return FoodItem.objects.filter(is_available=True)[:6]


@api_view(['GET'])
@permission_classes([AllowAny])
def categories_view(request):
    """GET /api/menu/categories/ -> ["All", "Pizza", "Burger", ...]"""
    return Response(['All'] + [value for value, _ in FoodItem.CATEGORY_CHOICES])
