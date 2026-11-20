from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from cart.models import Cart
from menu.models import FoodItem

CHECKOUT = {
    'customer_name': 'Asha Rao', 'phone': '9999999999',
    'delivery_address': '12 MG Road', 'payment_method': 'COD',
}


def client_for(user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {Token.objects.get_or_create(user=user)[0].key}')
    return client


class FullFlowTests(APITestCase):
    """Cart -> checkout -> delivery, end to end."""

    def setUp(self):
        self.pizza = FoodItem.objects.create(name='Cheese Pizza', price=299, category='Pizza')
        self.burger = FoodItem.objects.create(name='Chicken Burger', price=199, category='Burger')
        self.customer = User.objects.create_user('asha', password='secret123')
        self.other = User.objects.create_user('ravi', password='secret123')
        self.staff = User.objects.create_user('rider', password='secret123')
        self.staff.profile.role = 'delivery'
        self.staff.profile.save()
        self.c = client_for(self.customer)

    def test_cart_requires_login(self):
        self.assertEqual(APIClient().get('/api/cart/').status_code, 401)

    def test_add_twice_increments_quantity_without_duplicates(self):
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        res = self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        self.assertEqual(len(res.data['items']), 1)
        self.assertEqual(res.data['items'][0]['quantity'], 2)
        self.assertEqual(res.data['total_items'], 2)
        self.assertEqual(float(res.data['subtotal']), 598)
        self.assertEqual(float(res.data['delivery_fee']), 40)
        self.assertEqual(float(res.data['grand_total']), 638)

    def test_cannot_add_unavailable_item(self):
        self.burger.is_available = False
        self.burger.save()
        res = self.c.post('/api/cart/items/', {'food_id': self.burger.id})
        self.assertEqual(res.status_code, 400)

    def test_update_and_remove_items(self):
        item_id = self.c.post('/api/cart/items/', {'food_id': self.pizza.id}).data['items'][0]['id']
        res = self.c.patch(f'/api/cart/items/{item_id}/', {'quantity': 5}, format='json')
        self.assertEqual(res.data['items'][0]['quantity'], 5)
        res = self.c.patch(f'/api/cart/items/{item_id}/', {'quantity': 0}, format='json')
        self.assertEqual(res.data['items'], [])
        self.assertEqual(float(res.data['delivery_fee']), 0)  # no fee on an empty cart

    def test_cannot_touch_someone_elses_cart(self):
        item_id = self.c.post('/api/cart/items/', {'food_id': self.pizza.id}).data['items'][0]['id']
        other = client_for(self.other)
        self.assertEqual(other.delete(f'/api/cart/items/{item_id}/').status_code, 404)

    def test_clear_cart(self):
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        self.assertEqual(self.c.delete('/api/cart/').data['items'], [])

    def test_checkout_snapshots_prices_and_clears_cart(self):
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        self.c.post('/api/cart/items/', {'food_id': self.burger.id})
        # a client-supplied total must be ignored
        res = self.c.post('/api/orders/', {**CHECKOUT, 'total_amount': 1}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(float(res.data['total_amount']), 299 + 199 + 40)
        self.assertEqual(res.data['status'], 'Pending')
        self.assertTrue(res.data['order_number'].startswith('FP'))
        self.assertEqual(Cart.objects.get(user=self.customer).items.count(), 0)

        self.pizza.price = 999
        self.pizza.save()
        order = self.c.get(f"/api/orders/{res.data['id']}/").data
        self.assertEqual(float(order['items'][0]['price']) + float(order['items'][1]['price']), 299 + 199)

    def test_checkout_rejects_empty_cart_and_missing_fields(self):
        self.assertEqual(self.c.post('/api/orders/', CHECKOUT).status_code, 400)
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        res = self.c.post('/api/orders/', {'customer_name': 'x'})
        self.assertEqual(res.status_code, 400)
        self.assertIn('phone', res.data)

    def test_orders_are_private(self):
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        order_id = self.c.post('/api/orders/', CHECKOUT).data['id']
        other = client_for(self.other)
        self.assertEqual(other.get(f'/api/orders/{order_id}/').status_code, 404)
        self.assertEqual(other.get('/api/orders/').data, [])
        self.assertEqual(len(self.c.get('/api/orders/').data), 1)

    def test_delivery_flow(self):
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        order_id = self.c.post('/api/orders/', CHECKOUT).data['id']

        # customers are locked out of the dashboard
        self.assertEqual(self.c.get('/api/delivery/orders/').status_code, 403)
        self.assertEqual(APIClient().get('/api/delivery/orders/').status_code, 401)

        staff = client_for(self.staff)
        self.assertEqual(len(staff.get('/api/delivery/orders/').data['active']), 1)

        seen = ['Pending']
        while True:
            res = staff.post(f'/api/delivery/orders/{order_id}/advance/')
            if res.status_code == 400:
                break
            seen.append(res.data['status'])
        self.assertEqual(seen, ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'])

        dash = staff.get('/api/delivery/orders/').data
        self.assertEqual(dash['active'], [])
        self.assertEqual(dash['completed'][0]['status'], 'Delivered')
        # the customer sees the same status
        self.assertEqual(self.c.get(f'/api/orders/{order_id}/').data['status'], 'Delivered')

    def test_cancel_order(self):
        self.c.post('/api/cart/items/', {'food_id': self.pizza.id})
        order_id = self.c.post('/api/orders/', CHECKOUT).data['id']
        staff = client_for(self.staff)
        res = staff.post(f'/api/delivery/orders/{order_id}/cancel/')
        self.assertEqual(res.data['status'], 'Cancelled')
        self.assertEqual(staff.post(f'/api/delivery/orders/{order_id}/cancel/').status_code, 400)
