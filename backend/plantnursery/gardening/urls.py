from django.urls import path

from .views import (
    AdminGardeningTaskTypeListCreateView,
    AdminGardeningTaskTypeDetailView,
    AdminCareScheduleListCreateView,
    AdminCareTaskListView,
    AdminCareHistoryListView,
    StaffAvailableCareTaskListView,
    StaffMyCareTaskListView,
    StaffClaimCareTaskView,
    StaffStartCareTaskView,
    StaffCompleteCareTaskView,
    StaffSkipCareTaskView,
)


urlpatterns = [

    # Admin
    path(
        'admin/task-types/',
        AdminGardeningTaskTypeListCreateView.as_view()
    ),
    path(
        'admin/task-types/<int:pk>/',
        AdminGardeningTaskTypeDetailView.as_view()
    ),
    path(
        'admin/schedules/',
        AdminCareScheduleListCreateView.as_view()
    ),
    path(
        'admin/schedules/<int:pk>/',
        AdminCareScheduleListCreateView.as_view()
    ),

    path(
        'admin/history/',
        AdminCareHistoryListView.as_view(),
        name='admin-care-history'
    ),

    # Gardening Staff
    path(
        'staff/tasks/available/',
        StaffAvailableCareTaskListView.as_view(),
        name='staff-available-care-tasks'
    ),

    path(
        'staff/tasks/my/',
        StaffMyCareTaskListView.as_view(),
        name='staff-my-care-tasks'
    ),

    path(
        'staff/tasks/<int:pk>/claim/',
        StaffClaimCareTaskView.as_view(),
        name='staff-claim-care-task'
    ),

    path(
        'staff/tasks/<int:pk>/start/',
        StaffStartCareTaskView.as_view(),
        name='staff-start-care-task'
    ),

    path(
        'staff/tasks/<int:pk>/complete/',
        StaffCompleteCareTaskView.as_view(),
        name='staff-complete-care-task'
    ),

    path(
        'staff/tasks/<int:pk>/skip/',
        StaffSkipCareTaskView.as_view(),
        name='staff-skip-care-task'
    ),
    path(
    'admin/tasks/',
    AdminCareTaskListView.as_view(),
    name='admin-care-tasks'
),
]