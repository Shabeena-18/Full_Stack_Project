from django.urls import path

from . import views

app_name = 'delivery'

urlpatterns = [
    path('orders/', views.DashboardView.as_view(), name='dashboard'),
    path('orders/<int:order_id>/advance/', views.AdvanceStatusView.as_view(), name='advance'),
    path('orders/<int:order_id>/cancel/', views.CancelOrderView.as_view(), name='cancel'),
]
