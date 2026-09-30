from django.urls import path

from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    PlantListCreateView,
    PlantDetailView,
    StaffStockListView,
    StaffStockRestockView,
    StaffStockHistoryView,
)


urlpatterns = [

    # =====================================================
    # CATEGORY
    # =====================================================

    path(
        'categories/',
        CategoryListCreateView.as_view(),
        name='category-list-create'
    ),

    path(
        'categories/<int:pk>/',
        CategoryDetailView.as_view(),
        name='category-detail'
    ),


    # =====================================================
    # PLANT
    # =====================================================

    path(
        '',
        PlantListCreateView.as_view(),
        name='plant-list-create'
    ),

    path(
        '<int:pk>/',
        PlantDetailView.as_view(),
        name='plant-detail'
    ),


    # =====================================================
    # STAFF STOCK
    # =====================================================

    path(
        'staff/stock/',
        StaffStockListView.as_view(),
        name='staff-stock'
    ),

    path(
        'staff/stock/<int:pk>/restock/',
        StaffStockRestockView.as_view(),
        name='staff-stock-restock'
    ),

    path(
        'staff/stock/history/',
        StaffStockHistoryView.as_view(),
        name='staff-stock-history'
    ),

]