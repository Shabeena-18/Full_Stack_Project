from django.urls import path

from . import views

app_name = 'menu'

urlpatterns = [
    path('', views.MenuListView.as_view(), name='list'),
    path('popular/', views.PopularDishesView.as_view(), name='popular'),
    path('categories/', views.categories_view, name='categories'),
]
