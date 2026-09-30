from django.urls import path
from .views import CartView, CartDetailView, WishlistDetailView, WishlistView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('<int:pk>/', CartDetailView.as_view(), name='cart-detail'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path(
        'wishlist/<int:pk>/',
        WishlistDetailView.as_view(),
        name='wishlist-detail'
    ),

]