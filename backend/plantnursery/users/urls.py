from django.urls import path
from .views import AdminCustomerDetailView, AdminCustomerListView, AdminStaffDetailView, AdminStaffResponsibilityView, LoginView, RegisterView, UserProfileView, AdminStaffListView,  StaffResponsibilityView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path(
        'profile/',
        UserProfileView.as_view(),
        name='profile'
    ),
    path(
    'admin/customers/',
    AdminCustomerListView.as_view(),
    name='admin-customers'
),

path(
    'admin/customers/<int:pk>/',
    AdminCustomerDetailView.as_view(),
    name='admin-customer-detail'
),
path(
    'admin/staff/',
    AdminStaffListView.as_view(),
    name='admin-staff'
),

path(
    'admin/staff/<int:pk>/',
    AdminStaffDetailView.as_view(),
    name='admin-staff-detail'
),
path(
    'admin/staff/<int:pk>/responsibilities/',
    AdminStaffResponsibilityView.as_view(),
    name='admin-staff-responsibilities'
),
path(
    'staff/responsibilities/',
    StaffResponsibilityView.as_view(),
    name='staff-responsibilities'
),
]