from django.contrib.auth.models import User
from rest_framework.test import APITestCase

SIGNUP = {
    'full_name': 'Asha Rao', 'username': 'asha', 'email': 'asha@example.com',
    'phone_number': '9999999999', 'password': 'secret123', 'confirm_password': 'secret123',
}


class AuthTests(APITestCase):
    def test_signup_creates_user_and_profile(self):
        res = self.client.post('/api/auth/signup/', SIGNUP)
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(username='asha')
        self.assertEqual(user.profile.phone_number, '9999999999')
        self.assertEqual(user.profile.role, 'customer')
        self.assertNotEqual(user.password, 'secret123')  # hashed
        self.assertNotIn('password', res.data)

    def test_signup_validation(self):
        res = self.client.post('/api/auth/signup/', {**SIGNUP, 'confirm_password': 'nope'})
        self.assertEqual(res.status_code, 400)
        self.assertIn('confirm_password', res.data)

        res = self.client.post('/api/auth/signup/', {**SIGNUP, 'password': 'abc', 'confirm_password': 'abc'})
        self.assertEqual(res.status_code, 400)
        self.assertIn('password', res.data)

        self.client.post('/api/auth/signup/', SIGNUP)
        res = self.client.post('/api/auth/signup/', {**SIGNUP, 'email': 'other@example.com'})
        self.assertIn('username', res.data)

    def test_login_profile_logout(self):
        self.client.post('/api/auth/signup/', SIGNUP)

        bad = self.client.post('/api/auth/login/', {'username': 'asha', 'password': 'wrong'})
        self.assertEqual(bad.status_code, 400)

        res = self.client.post('/api/auth/login/', {'username': 'asha', 'password': 'secret123'})
        self.assertEqual(res.status_code, 200)
        token = res.data['token']
        self.assertEqual(res.data['user']['role'], 'customer')

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(self.client.get('/api/auth/profile/').data['username'], 'asha')

        self.assertEqual(self.client.post('/api/auth/logout/').status_code, 204)
        self.assertEqual(self.client.get('/api/auth/profile/').status_code, 401)

    def test_profile_requires_login(self):
        self.assertEqual(self.client.get('/api/auth/profile/').status_code, 401)
