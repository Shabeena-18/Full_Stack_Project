# """
# Django settings for the Food Paradise API.

# The backend is a pure JSON API (Django REST Framework). All pages are
# rendered by the React app in ../frontend, which talks to this server
# through the endpoints under /api/.

# Sensible defaults are provided for local development. For deployment,
# override them with environment variables (see backend/.env.example).
# """
# import os
# from pathlib import Path

# import dj_database_url

# BASE_DIR = Path(__file__).resolve().parent.parent


# def env_list(name, default=''):
#     return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]


# # --------------------------------------------------------------------------
# # Core
# # --------------------------------------------------------------------------
# SECRET_KEY = os.environ.get(
#     'DJANGO_SECRET_KEY',
#     'django-insecure-food-paradise-dev-key-change-in-production',
# )
# DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() == 'true'
# ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', '*' if DEBUG else 'localhost,127.0.0.1')

# # Render tells us its public hostname automatically - trust it.
# RENDER_HOST = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
# if RENDER_HOST:
#     ALLOWED_HOSTS.append(RENDER_HOST)

# # Needed for the Django admin login over https.
# CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')
# if RENDER_HOST:
#     CSRF_TRUSTED_ORIGINS.append(f'https://{RENDER_HOST}')

# # Behind Render's proxy, trust the forwarded https header.
# if not DEBUG:
#     SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',

#     # Third-party
#     'rest_framework',
#     'rest_framework.authtoken',
#     'corsheaders',

#     # Food Paradise apps
#     'accounts',   # signup / login / profile / roles
#     'menu',       # FoodItem + menu API
#     'cart',       # Cart & CartItem API
#     'orders',     # Order & OrderItem, checkout
#     'delivery',   # delivery-staff API
# ]

# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'whitenoise.middleware.WhiteNoiseMiddleware',  # serves admin CSS/JS in production
#     'corsheaders.middleware.CorsMiddleware',  # must sit above CommonMiddleware
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# ROOT_URLCONF = 'config.urls'
# WSGI_APPLICATION = 'config.wsgi.application'

# # Templates are only needed for the Django admin site.
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# # --------------------------------------------------------------------------
# # Database - SQLite locally, PostgreSQL when DATABASE_URL is set
# # --------------------------------------------------------------------------
# # If DATABASE_URL is set (Render provides it) we use PostgreSQL, otherwise SQLite.
# DATABASES = {
#     'default': dj_database_url.config(
#         default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
#         conn_max_age=600,
#     )
# }

# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]

# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True

# # --------------------------------------------------------------------------
# # Static & media files
# # --------------------------------------------------------------------------
# STATIC_URL = '/static/'
# STATIC_ROOT = BASE_DIR / 'staticfiles'
# STORAGES = {
#     'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
#     'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'},
# }

# MEDIA_URL = '/media/'
# MEDIA_ROOT = BASE_DIR / 'media'

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # --------------------------------------------------------------------------
# # Django REST Framework
# # --------------------------------------------------------------------------
# REST_FRAMEWORK = {
#     # The React app sends:  Authorization: Token <key>
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'rest_framework.authentication.TokenAuthentication',
#     ],
#     # Everything requires a login unless a view explicitly opens itself up.
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_RENDERER_CLASSES': [
#         'rest_framework.renderers.JSONRenderer',
#     ] + (['rest_framework.renderers.BrowsableAPIRenderer'] if DEBUG else []),
# }

# # --------------------------------------------------------------------------
# # CORS - which frontends may call this API from a browser
# # (not needed when using the Vite dev proxy, but useful when the frontend
# # is deployed on a different domain)
# # --------------------------------------------------------------------------
# CORS_ALLOWED_ORIGINS = env_list(
#     'CORS_ALLOWED_ORIGINS',
#     'http://localhost:5173,http://127.0.0.1:5173',
# )

# # --------------------------------------------------------------------------
# # Business rules
# # --------------------------------------------------------------------------
# DELIVERY_FEE = 40  # flat delivery fee (INR), applied when the cart is not empty



"""
Django settings for the Food Paradise API.

The backend is a pure JSON API.
React frontend communicates with Django through /api/ endpoints.
"""

import os
from pathlib import Path

import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent


# --------------------------------------------------------------------------
# Environment variable helper
# --------------------------------------------------------------------------

def env_list(name, default=''):
    return [
        item.strip()
        for item in os.environ.get(name, default).split(',')
        if item.strip()
    ]


# --------------------------------------------------------------------------
# Core settings
# --------------------------------------------------------------------------

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-food-paradise-dev-key-change-in-production',
)

DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = env_list(
    'DJANGO_ALLOWED_HOSTS',
    '*' if DEBUG else 'localhost,127.0.0.1'
)

# Render automatically provides its public hostname.
RENDER_HOST = os.environ.get('RENDER_EXTERNAL_HOSTNAME')

if RENDER_HOST:
    ALLOWED_HOSTS.append(RENDER_HOST)


# --------------------------------------------------------------------------
# CSRF trusted origins
# --------------------------------------------------------------------------

CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')

if RENDER_HOST:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RENDER_HOST}')


# Trust HTTPS forwarded by Render.
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# --------------------------------------------------------------------------
# Installed applications
# --------------------------------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party applications
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    # Food Paradise applications
    'accounts',
    'menu',
    'cart',
    'orders',
    'delivery',
]


# --------------------------------------------------------------------------
# Middleware
# --------------------------------------------------------------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

    # CORS middleware must be above CommonMiddleware.
    'corsheaders.middleware.CorsMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# --------------------------------------------------------------------------
# URL and WSGI configuration
# --------------------------------------------------------------------------

ROOT_URLCONF = 'config.urls'

WSGI_APPLICATION = 'config.wsgi.application'


# --------------------------------------------------------------------------
# Templates
# --------------------------------------------------------------------------

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# --------------------------------------------------------------------------
# Database
# SQLite locally, PostgreSQL on Render when DATABASE_URL is configured.
# --------------------------------------------------------------------------

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
    )
}


# --------------------------------------------------------------------------
# Password validation
# --------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'
    },
]


# --------------------------------------------------------------------------
# Language and time
# --------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# --------------------------------------------------------------------------
# Static and media files
# --------------------------------------------------------------------------

STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'

MEDIA_ROOT = BASE_DIR / 'media'


# --------------------------------------------------------------------------
# Default primary key
# --------------------------------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --------------------------------------------------------------------------
# Django REST Framework
# --------------------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],

    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ] + (
        ['rest_framework.renderers.BrowsableAPIRenderer']
        if DEBUG else []
    ),
}


# --------------------------------------------------------------------------
# CORS configuration
# --------------------------------------------------------------------------

# Render environment variable:
# CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com

# Local development URLs are used when the environment variable is absent.

CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173',
)


# --------------------------------------------------------------------------
# Business rules
# --------------------------------------------------------------------------

DELIVERY_FEE = 40
