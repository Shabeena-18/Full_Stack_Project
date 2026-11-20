from django.core.management.base import BaseCommand
from menu.models import FoodItem


# Sample data used to populate the menu for classroom demonstration.
# image_url points to a free placeholder/food image service so cards
# always look good even without uploading real photos.
SAMPLE_FOODS = [
    {
        'name': 'Cheese Pizza',
        'description': 'Classic pizza loaded with mozzarella and cheddar cheese.',
        'price': 299,
        'category': 'Pizza',
        'image_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    },
    {
        'name': 'Chicken Burger',
        'description': 'Juicy grilled chicken patty with lettuce, cheese and special sauce.',
        'price': 199,
        'category': 'Burger',
        'image_url': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    },
    {
        'name': 'Healthy Salad',
        'description': 'Fresh garden vegetables tossed with olive oil and herbs.',
        'price': 149,
        'category': 'Healthy',
        'image_url': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    },
    {
        'name': 'Strawberry Pastry',
        'description': 'Soft sponge cake layered with fresh cream and strawberries.',
        'price': 299,
        'category': 'Desserts',
        'image_url': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600',
    },
    {
        'name': 'French Fries',
        'description': 'Crispy golden fries served with tomato ketchup.',
        'price': 129,
        'category': 'Snacks',
        'image_url': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
    },
    {
        'name': 'Veg Sandwich',
        'description': 'Multi-grain bread stuffed with fresh veggies and mint chutney.',
        'price': 179,
        'category': 'Snacks',
        'image_url': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=600',
    },
    {
        'name': 'Healthy Bowl',
        'description': 'Quinoa, greens, roasted vegetables and a light dressing.',
        'price': 229,
        'category': 'Healthy',
        'image_url': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',
    },
    {
        'name': 'Chinese Noodles',
        'description': 'Stir fried noodles tossed with vegetables in soy sauce.',
        'price': 199,
        'category': 'Chinese',
        'image_url': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
    },
    {
        'name': 'Chicken Biryani',
        'description': 'Fragrant basmati rice cooked with spiced chicken and herbs.',
        'price': 299,
        'category': 'Indian',
        'image_url': 'https://images.unsplash.com/photo-1633945274309-2c9f9f6e0d5b?w=600',
    },
    {
        'name': 'Paneer Butter Masala',
        'description': 'Soft paneer cubes simmered in a rich buttery tomato gravy.',
        'price': 249,
        'category': 'Indian',
        'image_url': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600',
    },
]


class Command(BaseCommand):
    help = 'Populate the database with sample Food Paradise menu items.'

    def handle(self, *args, **options):
        created_count = 0
        for item in SAMPLE_FOODS:
            obj, created = FoodItem.objects.get_or_create(
                name=item['name'],
                defaults={
                    'description': item['description'],
                    'price': item['price'],
                    'category': item['category'],
                    'image_url': item['image_url'],
                    'is_available': True,
                },
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. {created_count} new food item(s) added. '
            f'Total items in menu: {FoodItem.objects.count()}'
        ))
