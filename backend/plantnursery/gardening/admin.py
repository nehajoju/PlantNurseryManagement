from django.contrib import admin

from .models import (
    PlantCareSchedule,
    PlantCareTask,
    PlantCareHistory
)


@admin.register(PlantCareSchedule)
class PlantCareScheduleAdmin(admin.ModelAdmin):

    list_display = (
        'plant',
        'care_type',
        'frequency_days',
        'next_due_date',
        'is_active',
    )

    list_filter = (
        'care_type',
        'is_active',
    )

    search_fields = (
        'plant__name',
    )


@admin.register(PlantCareTask)
class PlantCareTaskAdmin(admin.ModelAdmin):

    list_display = (
        'plant',
        'task_type',
        'due_date',
        'status',
        'assigned_staff',
    )

    list_filter = (
        'task_type',
        'status',
        'due_date',
    )

    search_fields = (
        'plant__name',
        'assigned_staff__username',
    )


@admin.register(PlantCareHistory)
class PlantCareHistoryAdmin(admin.ModelAdmin):

    list_display = (
        'plant',
        'care_type',
        'action',
        'performed_by',
        'performed_at',
    )

    list_filter = (
        'care_type',
        'action',
        'performed_at',
    )

    search_fields = (
        'plant__name',
        'performed_by__username',
    )