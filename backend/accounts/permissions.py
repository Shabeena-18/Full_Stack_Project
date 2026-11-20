from rest_framework.permissions import BasePermission


class IsDeliveryStaff(BasePermission):
    """Only delivery staff (or superusers) may use the delivery dashboard."""

    message = 'Only delivery staff can access this resource.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and hasattr(user, 'profile')
            and user.profile.is_delivery_staff
        )
