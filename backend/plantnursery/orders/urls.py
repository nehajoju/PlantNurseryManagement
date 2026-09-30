from django.urls import path
from .views import AdminAssignDeliveryStaffView, OrderReceiptView, OrderView,CreateRazorpayOrderView, StaffDeliveryStatsView, VerifyRazorpayPaymentView,AdminOrderListView,AdminOrderDetailView,StaffOrderListView,StaffOrderDetailView,StaffDeliveryListView,StaffDeliveryDetailView,StaffDeliveryActionView

urlpatterns = [
    path('', OrderView.as_view(), name='orders'),
    path('razorpay/create/', CreateRazorpayOrderView.as_view(), name='razorpay-create'),
     path(
        'razorpay/verify/',
        VerifyRazorpayPaymentView.as_view(),
        name='razorpay-verify'
    ),
    path(
    '<int:pk>/receipt/',
    OrderReceiptView.as_view(),
    name='order-receipt'
),
path(
    'admin/',
    AdminOrderListView.as_view(),
    name='admin-orders'
),

path(
    'admin/<int:pk>/',
    AdminOrderDetailView.as_view(),
    name='admin-order-detail'
),
path(
    'staff/',
    StaffOrderListView.as_view(),
    name='staff-orders'
),

path(
    'staff/<int:pk>/',
    StaffOrderDetailView.as_view(),
    name='staff-order-detail'
),
path(
    'staff/deliveries/',
    StaffDeliveryListView.as_view(),
    name='staff-deliveries'
),

path(
    'staff/deliveries/<int:pk>/',
    StaffDeliveryDetailView.as_view(),
    name='staff-delivery-detail'
),
path(
    'staff/deliveries/<int:pk>/action/',
    StaffDeliveryActionView.as_view(),
    name='staff-delivery-action'
),
path(
    'admin/<int:pk>/assign-staff/',
    AdminAssignDeliveryStaffView.as_view(),
    name='admin-assign-delivery-staff'
),
path(
    'staff/deliveries/stats/',
    StaffDeliveryStatsView.as_view(), 
    name='staff-delivery-stats'
),
]