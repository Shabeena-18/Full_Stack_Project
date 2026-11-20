from rest_framework.test import APITestCase

from .models import FoodItem


class MenuTests(APITestCase):
    def setUp(self):
        FoodItem.objects.create(name='Cheese Pizza', price=299, category='Pizza', image_url='http://img/p.jpg')
        FoodItem.objects.create(name='Chicken Burger', price=199, category='Burger')
        FoodItem.objects.create(name='Hidden Dish', price=99, category='Snacks', is_available=False)

    def test_menu_is_public_and_hides_unavailable(self):
        res = self.client.get('/api/menu/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual({f['name'] for f in res.data}, {'Cheese Pizza', 'Chicken Burger'})

    def test_filter_and_search(self):
        self.assertEqual(len(self.client.get('/api/menu/?category=Pizza').data), 1)
        self.assertEqual(len(self.client.get('/api/menu/?category=All').data), 2)
        self.assertEqual(self.client.get('/api/menu/?search=burg').data[0]['name'], 'Chicken Burger')

    def test_image_falls_back_to_url(self):
        pizza = self.client.get('/api/menu/?category=Pizza').data[0]
        self.assertEqual(pizza['image'], 'http://img/p.jpg')

    def test_categories(self):
        cats = self.client.get('/api/menu/categories/').data
        self.assertEqual(cats[0], 'All')
        self.assertIn('Pizza', cats)
