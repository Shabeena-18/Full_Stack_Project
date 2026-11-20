from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """The logged-in user's public details (User + Profile in one object)."""

    full_name = serializers.CharField(source='profile.full_name')
    phone_number = serializers.CharField(source='profile.phone_number')
    role = serializers.CharField(source='profile.role')
    role_display = serializers.CharField(source='profile.get_role_display')
    is_delivery_staff = serializers.BooleanField(source='profile.is_delivery_staff')
    member_since = serializers.DateTimeField(source='profile.created_at')

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'full_name', 'phone_number',
            'role', 'role_display', 'is_delivery_staff', 'member_since',
        )
        read_only_fields = fields


class SignupSerializer(serializers.Serializer):
    """Validates the signup form and creates the User + Profile."""

    full_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # create_user() hashes the password - it is never stored in plain text.
        first_name, _, last_name = validated_data['full_name'].partition(' ')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        # A Profile already exists thanks to the post_save signal.
        profile = user.profile
        profile.full_name = validated_data['full_name']
        profile.phone_number = validated_data['phone_number']
        profile.role = 'customer'
        profile.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
