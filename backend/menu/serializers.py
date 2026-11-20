from rest_framework import serializers

from .models import FoodItem


class FoodItemSerializer(serializers.ModelSerializer):
    # One `image` field for the frontend: the uploaded file if there is one,
    # otherwise the fallback image_url. Always an absolute URL.
    image = serializers.SerializerMethodField()

    class Meta:
        model = FoodItem
        fields = ('id', 'name', 'description', 'price', 'category', 'image', 'is_available')

    def get_image(self, obj):
        url = obj.display_image
        request = self.context.get('request')
        if url and request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url
