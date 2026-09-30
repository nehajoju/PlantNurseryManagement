from django.utils import timezone
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import (
    GardeningTaskType,
    PlantCareSchedule,
    PlantCareTask,
    PlantCareHistory
)

from .serializers import (
    GardeningTaskTypeSerializer,
    PlantCareScheduleSerializer,
    PlantCareTaskSerializer,
    PlantCareHistorySerializer
)

from users.permissions import (
    IsAdminUser,
    HasGardeningResponsibility
)

# ============================================================
# ADMIN - GARDENING TASK TYPES
# ============================================================

class AdminGardeningTaskTypeListCreateView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        task_types = GardeningTaskType.objects.filter(
            is_active=True
        ).order_by('name')

        serializer = GardeningTaskTypeSerializer(
            task_types,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = GardeningTaskTypeSerializer(
            data=request.data
        )

        if serializer.is_valid():

            task_type = serializer.save()

            return Response(
                GardeningTaskTypeSerializer(task_type).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminGardeningTaskTypeDetailView(APIView):

    permission_classes = [IsAdminUser]

    def put(self, request, pk):

        try:
            task_type = GardeningTaskType.objects.get(
                pk=pk,
                is_active=True
            )

        except GardeningTaskType.DoesNotExist:

            return Response(
                {'error': 'Gardening task type not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = GardeningTaskTypeSerializer(
            task_type,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            task_type = serializer.save()

            return Response(
                GardeningTaskTypeSerializer(task_type).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        try:
            task_type = GardeningTaskType.objects.get(
                pk=pk,
                is_active=True
            )

        except GardeningTaskType.DoesNotExist:

            return Response(
                {'error': 'Gardening task type not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        task_type.is_active = False

        task_type.save(
            update_fields=['is_active']
        )

        return Response(
            {
                'message':
                'Gardening task type deleted successfully.'
            },
            status=status.HTTP_200_OK
        )
# ============================================================
# ADMIN - CARE SCHEDULES
# ============================================================

class AdminCareScheduleListCreateView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        schedules = PlantCareSchedule.objects.filter(
    is_active=True
).select_related(
    'plant'
).order_by('next_due_date')

        serializer = PlantCareScheduleSerializer(
            schedules,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = PlantCareScheduleSerializer(
            data=request.data
        )

        if serializer.is_valid():

            schedule = serializer.save()

            return Response(
                PlantCareScheduleSerializer(schedule).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    def delete(self, request, pk):

        try:
            schedule = PlantCareSchedule.objects.get(pk=pk)

        except PlantCareSchedule.DoesNotExist:

            return Response(
                {'error': 'Care schedule not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        schedule.is_active = False
        schedule.save(
            update_fields=[
                'is_active',
                'updated_at'
            ]
        )

        return Response(
            {
                'message': 'Care schedule deleted successfully.'
            },
            status=status.HTTP_200_OK
        )

# ============================================================
# ADMIN - ALL CARE TASKS
# ============================================================

class AdminCareTaskListView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        tasks = PlantCareTask.objects.select_related(
            'plant',
            'schedule',
            'assigned_staff'
        ).order_by('due_date')

        serializer = PlantCareTaskSerializer(
            tasks,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# ADMIN - CARE HISTORY
# ============================================================

class AdminCareHistoryListView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        history = PlantCareHistory.objects.select_related(
            'plant',
            'performed_by'
        ).order_by('-performed_at')

        serializer = PlantCareHistorySerializer(
            history,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# STAFF - AVAILABLE CARE TASKS
# ============================================================

class StaffAvailableCareTaskListView(APIView):

    permission_classes = [HasGardeningResponsibility]

    def get(self, request):

        tasks = PlantCareTask.objects.filter(
            status='Pending'
        ).select_related(
            'plant',
            'schedule'
        ).order_by('due_date')

        serializer = PlantCareTaskSerializer(
            tasks,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# STAFF - MY CARE TASKS
# ============================================================

class StaffMyCareTaskListView(APIView):

    permission_classes = [HasGardeningResponsibility]

    def get(self, request):

        tasks = PlantCareTask.objects.filter(
            assigned_staff=request.user
        ).select_related(
            'plant',
            'schedule'
        ).order_by('due_date')

        serializer = PlantCareTaskSerializer(
            tasks,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# STAFF - CLAIM TASK
# ============================================================

class StaffClaimCareTaskView(APIView):

    permission_classes = [HasGardeningResponsibility]

    def post(self, request, pk):

        try:
            task = PlantCareTask.objects.get(pk=pk)

        except PlantCareTask.DoesNotExist:

            return Response(
                {'error': 'Care task not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if task.status != 'Pending':

            return Response(
                {
                    'error':
                    'This task is no longer available.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        task.assigned_staff = request.user
        task.status = 'Claimed'
        task.save(
            update_fields=[
                'assigned_staff',
                'status',
                'updated_at'
            ]
        )

        return Response(
            PlantCareTaskSerializer(task).data
        )


# ============================================================
# STAFF - START TASK
# ============================================================

class StaffStartCareTaskView(APIView):

    permission_classes = [HasGardeningResponsibility]

    def post(self, request, pk):

        try:
            task = PlantCareTask.objects.get(
                pk=pk,
                assigned_staff=request.user
            )

        except PlantCareTask.DoesNotExist:

            return Response(
                {'error': 'Task not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if task.status != 'Claimed':

            return Response(
                {
                    'error':
                    'Only claimed tasks can be started.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = 'In Progress'
        task.started_at = timezone.now()

        task.save(
            update_fields=[
                'status',
                'started_at',
                'updated_at'
            ]
        )

        return Response(
            PlantCareTaskSerializer(task).data
        )


# ============================================================
# STAFF - COMPLETE TASK
# ============================================================

class StaffCompleteCareTaskView(APIView):

    permission_classes = [HasGardeningResponsibility]

    def post(self, request, pk):

        try:
            task = PlantCareTask.objects.get(
                pk=pk,
                assigned_staff=request.user
            )

        except PlantCareTask.DoesNotExist:

            return Response(
                {'error': 'Task not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if task.status != 'In Progress':

            return Response(
                {
                    'error':
                    'Only tasks in progress can be completed.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        staff_notes = request.data.get(
            'staff_notes',
            ''
        )

        with transaction.atomic():

            task.status = 'Completed'
            task.completed_at = timezone.now()
            task.staff_notes = staff_notes

            task.save(
                update_fields=[
                    'status',
                    'completed_at',
                    'staff_notes',
                    'updated_at'
                ]
            )

            PlantCareHistory.objects.create(
                plant=task.plant,
                task=task,
                care_type=task.task_type,
                action='Completed',
                performed_by=request.user,
                notes=staff_notes
            )

        return Response(
            PlantCareTaskSerializer(task).data
        )


# ============================================================
# STAFF - SKIP TASK
# ============================================================

class StaffSkipCareTaskView(APIView):

    permission_classes = [HasGardeningResponsibility]

    def post(self, request, pk):

        try:
            task = PlantCareTask.objects.get(
                pk=pk,
                assigned_staff=request.user
            )

        except PlantCareTask.DoesNotExist:

            return Response(
                {'error': 'Task not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if task.status not in [
            'Claimed',
            'In Progress'
        ]:

            return Response(
                {
                    'error':
                    'This task cannot be skipped.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        skip_reason = request.data.get(
            'skip_reason',
            ''
        ).strip()

        if not skip_reason:

            return Response(
                {
                    'error':
                    'A reason is required when skipping a task.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            task.status = 'Skipped'
            task.skip_reason = skip_reason

            task.save(
                update_fields=[
                    'status',
                    'skip_reason',
                    'updated_at'
                ]
            )

            PlantCareHistory.objects.create(
                plant=task.plant,
                task=task,
                care_type=task.task_type,
                action='Skipped',
                performed_by=request.user,
                notes=skip_reason
            )

        return Response(
            PlantCareTaskSerializer(task).data
        )