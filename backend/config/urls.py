"""
Root URL configuration.

    /admin/          Django admin (manage food items, users, orders)
    /api/auth/...    signup, login, logout, profile
    /api/menu/...    food menu
    /api/cart/...    shopping cart
    /api/orders/...  checkout and order history
    /api/delivery/.. delivery-staff dashboard
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/delivery/', include('delivery.urls')),
]

# Serve uploaded food images during development.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
