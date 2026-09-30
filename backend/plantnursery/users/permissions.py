from rest_framework.permissions import BasePermission
from .models import StaffResponsibility

class IsAdminUser(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )

class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and not request.user.is_superuser
        )

class HasDeliveryResponsibility(BasePermission):

    def has_permission(self, request, view):
        if not (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and not request.user.is_superuser
        ):
            return False

        responsibility, created = StaffResponsibility.objects.get_or_create(
            user=request.user
        )

        return responsibility.can_delivery


class HasStockResponsibility(BasePermission):

    def has_permission(self, request, view):
        if not (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and not request.user.is_superuser
        ):
            return False

        responsibility, created = StaffResponsibility.objects.get_or_create(
            user=request.user
        )

        return responsibility.can_stock


class HasGardeningResponsibility(BasePermission):

    def has_permission(self, request, view):
        if not (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and not request.user.is_superuser
        ):
            return False

        responsibility, created = StaffResponsibility.objects.get_or_create(
            user=request.user
        )

        return responsibility.can_gardening