from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from plants.models import Plant


class GardeningTaskType(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


class PlantCareSchedule(models.Model):

    plant = models.ForeignKey(
        Plant,
        on_delete=models.CASCADE,
        related_name='care_schedules'
    )

    care_type = models.ForeignKey(
        GardeningTaskType,
        on_delete=models.PROTECT,
        related_name='care_schedules'
    )

    frequency_days = models.PositiveIntegerField(
        help_text='Number of days between care activities.'
    )

    next_due_date = models.DateField()

    notes = models.TextField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f'{self.plant.name} - {self.care_type.name}'


class PlantCareTask(models.Model):

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Claimed', 'Claimed'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Skipped', 'Skipped'),
    ]

    task_type = models.CharField(
        max_length=100
    )

    plant = models.ForeignKey(
        Plant,
        on_delete=models.CASCADE,
        related_name='care_tasks'
    )

    schedule = models.ForeignKey(
        PlantCareSchedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )

    due_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )

    assigned_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gardening_tasks'
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    staff_notes = models.TextField(
        blank=True,
        null=True
    )

    skip_reason = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f'{self.plant.name} - {self.task_type} - {self.due_date}'

    @property
    def is_overdue(self):
        return (
            self.due_date < timezone.localdate()
            and self.status not in ['Completed', 'Skipped']
        )


class PlantCareHistory(models.Model):

    ACTION_CHOICES = [
        ('Completed', 'Completed'),
        ('Skipped', 'Skipped'),
    ]

    plant = models.ForeignKey(
        Plant,
        on_delete=models.CASCADE,
        related_name='care_history'
    )

    task = models.ForeignKey(
        PlantCareTask,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='history_records'
    )

    care_type = models.CharField(
        max_length=100
    )

    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )

    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plant_care_history'
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    performed_at = models.DateTimeField(
        default=timezone.now
    )

    def __str__(self):
        return (
            f'{self.plant.name} - '
            f'{self.care_type} - '
            f'{self.action}'
        )