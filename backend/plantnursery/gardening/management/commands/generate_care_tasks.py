from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from gardening.models import PlantCareSchedule, PlantCareTask


class Command(BaseCommand):

    help = 'Generate plant care tasks from due care schedules'

    def handle(self, *args, **options):

        today = timezone.localdate()

        schedules = PlantCareSchedule.objects.filter(
            is_active=True,
            next_due_date__lte=today
        ).select_related(
            'plant',
            'care_type'
        )

        created_count = 0

        for schedule in schedules:

            # Prevent duplicate task for the same schedule and date
            task_exists = PlantCareTask.objects.filter(
                schedule=schedule,
                due_date=schedule.next_due_date
            ).exists()

            if task_exists:
                continue

            PlantCareTask.objects.create(
                plant=schedule.plant,
                schedule=schedule,
                task_type=schedule.care_type.name,
                due_date=schedule.next_due_date,
                status='Pending'
            )

            # Move the schedule to its next due date
            schedule.next_due_date = (
                schedule.next_due_date
                + timedelta(days=schedule.frequency_days)
            )

            schedule.save(
                update_fields=[
                    'next_due_date',
                    'updated_at'
                ]
            )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'{created_count} care task(s) generated successfully.'
            )
        )