from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


# =========================================================
# LIST ALL NOTIFICATIONS
# =========================================================

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# GET UNREAD NOTIFICATION COUNT
# =========================================================

class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response({
            'unread_count': count
        })


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(
                pk=pk,
                recipient=request.user
            )

        except Notification.DoesNotExist:
            return Response(
                {
                    'error': 'Notification not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save(update_fields=['is_read'])

        return Response({
            'message': 'Notification marked as read.'
        })


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response({
            'message': 'All notifications marked as read.',
            'updated_count': updated_count
        })


# =========================================================
# DELETE ONE NOTIFICATION
# =========================================================

class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            notification = Notification.objects.get(
                pk=pk,
                recipient=request.user
            )

        except Notification.DoesNotExist:
            return Response(
                {
                    'error': 'Notification not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()

        return Response({
            'message': 'Notification deleted successfully.'
        })


# =========================================================
# DELETE / CLEAR ALL NOTIFICATIONS
# =========================================================

class NotificationDeleteAllView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        deleted_count, _ = Notification.objects.filter(
            recipient=request.user
        ).delete()

        return Response({
            'message': 'All notifications deleted successfully.',
            'deleted_count': deleted_count
        })