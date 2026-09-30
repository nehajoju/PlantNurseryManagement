from rest_framework import serializers

from .models import (
    GardeningTaskType,
    PlantCareSchedule,
    PlantCareTask,
    PlantCareHistory
)
class GardeningTaskTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = GardeningTaskType

        fields = [
            'id',
            'name',
            'description',
            'is_active',
            'created_at',
        ]

class PlantCareScheduleSerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(
        source='plant.name',
        read_only=True
    )

    care_type_name = serializers.CharField(
        source='care_type.name',
        read_only=True
    )

    class Meta:
        model = PlantCareSchedule

        fields = [
            'id',
            'plant',
            'plant_name',
            'care_type',
            'care_type_name',
            'frequency_days',
            'next_due_date',
            'notes',
            'is_active',
            'created_at',
            'updated_at',
        ]

class PlantCareTaskSerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(
        source='plant.name',
        read_only=True
    )

    assigned_staff_name = serializers.SerializerMethodField()

    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = PlantCareTask

        fields = [
            'id',
            'plant',
            'plant_name',
            'schedule',
            'task_type',
            'due_date',
            'status',
            'assigned_staff',
            'assigned_staff_name',
            'started_at',
            'completed_at',
            'staff_notes',
            'skip_reason',
            'is_overdue',
            'created_at',
            'updated_at',
        ]

    def get_assigned_staff_name(self, obj):

        if not obj.assigned_staff:
            return None

        full_name = (
            f'{obj.assigned_staff.first_name} '
            f'{obj.assigned_staff.last_name}'
        ).strip()

        return full_name or obj.assigned_staff.username


class PlantCareHistorySerializer(serializers.ModelSerializer):

    plant_name = serializers.CharField(
        source='plant.name',
        read_only=True
    )

    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PlantCareHistory

        fields = [
            'id',
            'plant',
            'plant_name',
            'task',
            'care_type',
            'action',
            'performed_by',
            'performed_by_name',
            'notes',
            'performed_at',
        ]

    def get_performed_by_name(self, obj):

        if not obj.performed_by:
            return None

        full_name = (
            f'{obj.performed_by.first_name} '
            f'{obj.performed_by.last_name}'
        ).strip()

        return full_name or obj.performed_by.username