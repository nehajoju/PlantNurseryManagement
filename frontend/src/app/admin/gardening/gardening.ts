import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Gardening as GardeningService } from '../../services/gardening';
import { PlantService } from '../../services/plant';

@Component({
  selector: 'app-admin-gardening',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gardening.html',
  styleUrl: './gardening.css'
})
export class Gardening implements OnInit {

  schedules: any[] = [];
  tasks: any[] = [];
  history: any[] = [];
  plants: any[] = [];
  taskTypes: any[] = [];

  activeTab:
    'schedules' |
    'tasks' |
    'history' |
    'task-types' = 'schedules';

  loading = true;
  errorMessage = '';

  // ==============================
  // SCHEDULE MODAL
  // ==============================

  showScheduleModal = false;
  scheduleLoading = false;
  scheduleError = '';

  scheduleForm = {
    plant: '',
    task_type: '',
    scheduled_date: '',
    due_date: '',
    description: ''
  };

  // Date restrictions
  today = this.getTodayDate();
  minDueDate = this.today;

  // ==============================
  // TASK TYPE MODAL
  // ==============================

  showTaskTypeModal = false;
  taskTypeLoading = false;
  taskTypeError = '';

  editingTaskTypeId: number | null = null;

  taskTypeForm = {
    name: '',
    description: ''
  };

  // ==============================
  // TOAST
  // ==============================

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private toastTimer: any;

  constructor(
    private gardeningService: GardeningService,
    private plantService: PlantService
  ) {}

  // ==============================
  // INITIAL LOAD
  // ==============================

  ngOnInit(): void {
    this.today = this.getTodayDate();
    this.minDueDate = this.today;

    this.loadPlants();
    this.loadTaskTypes();
    this.loadAll();
  }

  // ==============================
  // PLANTS
  // ==============================

  loadPlants(): void {

    this.plantService.getPlants().subscribe({

      next: (data) => {
        this.plants = data || [];
      },

      error: (error) => {
        console.error('Error loading plants:', error);
        this.plants = [];
      }

    });
  }

  // ==============================
  // TASK TYPES
  // ==============================

  loadTaskTypes(): void {

    this.gardeningService.getTaskTypes().subscribe({

      next: (data) => {

        this.taskTypes = Array.isArray(data)
          ? data
          : data?.results || [];

      },

      error: (error) => {

        console.error(
          'Error loading gardening task types:',
          error
        );

        this.taskTypes = [];

      }

    });
  }

  openTaskTypeModal(): void {

    this.editingTaskTypeId = null;

    this.taskTypeForm = {
      name: '',
      description: ''
    };

    this.taskTypeError = '';
    this.showTaskTypeModal = true;
  }

  openEditTaskTypeModal(taskType: any): void {

    this.editingTaskTypeId = taskType.id;

    this.taskTypeForm = {
      name: taskType.name || '',
      description: taskType.description || ''
    };

    this.taskTypeError = '';
    this.showTaskTypeModal = true;
  }

  closeTaskTypeModal(): void {

    if (this.taskTypeLoading) {
      return;
    }

    this.showTaskTypeModal = false;
    this.taskTypeError = '';
    this.editingTaskTypeId = null;
  }

  saveTaskType(): void {

    this.taskTypeError = '';

    const name = this.taskTypeForm.name.trim();

    const description =
      this.taskTypeForm.description.trim();

    if (!name) {

      this.taskTypeError =
        'Please enter a task type name.';

      return;
    }

    this.taskTypeLoading = true;

    const data = {
      name: name,
      description: description
    };

    // ==============================
    // EDIT EXISTING TASK TYPE
    // ==============================

    if (this.editingTaskTypeId !== null) {

      this.gardeningService
        .updateTaskType(
          this.editingTaskTypeId,
          data
        )
        .subscribe({

          next: () => {

            this.taskTypeLoading = false;

            this.closeTaskTypeModal();

            this.showSuccessToast(
              'Task type updated successfully.'
            );

            this.loadTaskTypes();

          },

          error: (error) => {

            this.taskTypeLoading = false;

            console.error(
              'Error updating task type:',
              error
            );

            this.taskTypeError =
              error?.error?.name?.[0] ||
              error?.error?.error ||
              'Unable to update the task type.';

          }

        });

      return;
    }

    // ==============================
    // CREATE NEW TASK TYPE
    // ==============================

    this.gardeningService
      .createTaskType(data)
      .subscribe({

        next: () => {

          this.taskTypeLoading = false;

          this.closeTaskTypeModal();

          this.showSuccessToast(
            'Task type created successfully.'
          );

          this.loadTaskTypes();

        },

        error: (error) => {

          this.taskTypeLoading = false;

          console.error(
            'Error creating task type:',
            error
          );

          this.taskTypeError =
            error?.error?.name?.[0] ||
            error?.error?.error ||
            'Unable to create the task type.';

        }

      });
  }

  deleteTaskType(taskType: any): void {

    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${taskType.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.gardeningService
      .deleteTaskType(taskType.id)
      .subscribe({

        next: () => {

          this.showSuccessToast(
            'Task type deactivated successfully.'
          );

          this.loadTaskTypes();

        },

        error: (error) => {

          console.error(
            'Error deleting task type:',
            error
          );

          this.showErrorToast(
            error?.error?.error ||
            'Unable to deactivate the task type.'
          );

        }

      });
  }

  // ==============================
  // LOAD GARDENING DATA
  // ==============================

  loadAll(): void {

    this.loading = true;
    this.errorMessage = '';

    this.loadSchedules();
  }

  loadSchedules(): void {

    this.gardeningService
      .getCareSchedules()
      .subscribe({

        next: (data) => {

          this.schedules =
            Array.isArray(data)
              ? data
              : data?.results || [];

          this.loadTasks();

        },

        error: (error) => {

          console.error(
            'Error loading gardening schedules:',
            error
          );

          this.errorMessage =
            error?.error?.error ||
            'Unable to load gardening schedules.';

          this.loading = false;

        }

      });
  }

  loadTasks(): void {

    this.gardeningService
      .getAllCareTasks()
      .subscribe({

        next: (data) => {

          this.tasks =
            Array.isArray(data)
              ? data
              : data?.results || [];

          this.loadHistory();

        },

        error: (error) => {

          console.error(
            'Error loading gardening tasks:',
            error
          );

          this.errorMessage =
            error?.error?.error ||
            'Unable to load gardening tasks.';

          this.loading = false;

        }

      });
  }

  loadHistory(): void {

    this.gardeningService
      .getCareHistory()
      .subscribe({

        next: (data) => {

          this.history =
            Array.isArray(data)
              ? data
              : data?.results || [];

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading gardening history:',
            error
          );

          this.errorMessage =
            error?.error?.error ||
            'Unable to load gardening history.';

          this.loading = false;

        }

      });
  }

  // ==============================
  // TABS
  // ==============================

  setTab(
    tab:
      'schedules' |
      'tasks' |
      'history' |
      'task-types'
  ): void {

    this.activeTab = tab;
  }

  // ==============================
  // DATE HELPER
  // ==============================

  private getTodayDate(): string {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ==============================
  // SCHEDULE MODAL
  // ==============================

  openScheduleModal(): void {

    this.today = this.getTodayDate();
    this.minDueDate = this.today;

    this.scheduleForm = {
      plant: '',
      task_type: '',
      scheduled_date: '',
      due_date: '',
      description: ''
    };

    this.scheduleError = '';
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {

    if (this.scheduleLoading) {
      return;
    }

    this.showScheduleModal = false;
    this.scheduleError = '';
  }

  onScheduledDateChange(date: string): void {

    this.minDueDate = date || this.today;

    if (
      this.scheduleForm.due_date &&
      this.scheduleForm.due_date < this.minDueDate
    ) {
      this.scheduleForm.due_date = '';
    }
  }

  createSchedule(): void {

    this.scheduleError = '';

    // ==============================
    // REQUIRED FIELD VALIDATION
    // ==============================

    if (!this.scheduleForm.plant.trim()) {

      this.scheduleError =
        'Please select a plant.';

      return;
    }

    if (!this.scheduleForm.task_type.trim()) {

      this.scheduleError =
        'Please select a task type.';

      return;
    }

    if (!this.scheduleForm.scheduled_date) {

      this.scheduleError =
        'Please select a scheduled date.';

      return;
    }

    if (!this.scheduleForm.due_date) {

      this.scheduleError =
        'Please select a due date.';

      return;
    }

    // ==============================
    // DATE VALIDATION
    // ==============================

    const today = this.getTodayDate();

    if (this.scheduleForm.scheduled_date < today) {

      this.scheduleError =
        'Scheduled date cannot be in the past.';

      return;
    }

    if (this.scheduleForm.due_date < today) {

      this.scheduleError =
        'Due date cannot be in the past.';

      return;
    }

    if (
      this.scheduleForm.due_date <
      this.scheduleForm.scheduled_date
    ) {

      this.scheduleError =
        'Due date cannot be before the scheduled date.';

      return;
    }

    // ==============================
    // CREATE SCHEDULE
    // ==============================

    this.scheduleLoading = true;

    const data = {

      plant:
        Number(this.scheduleForm.plant),

      care_type:
        Number(this.scheduleForm.task_type),

      frequency_days: 1,

      next_due_date:
        this.scheduleForm.due_date,

      notes:
        this.scheduleForm.description.trim()

    };

    this.gardeningService
      .createCareSchedule(data)
      .subscribe({

        next: () => {

          this.scheduleLoading = false;

          this.closeScheduleModal();

          this.showSuccessToast(
            'Gardening care schedule created successfully.'
          );

          this.loadAll();

        },

        error: (error) => {

          this.scheduleLoading = false;

          console.error(
            'Error creating gardening schedule:',
            error
          );

          this.scheduleError =
            error?.error?.error ||
            'Unable to create the gardening schedule.';

        }

      });
  }

  deleteSchedule(scheduleId: number): void {

    const confirmed = window.confirm(
      'Are you sure you want to delete this care schedule?'
    );

    if (!confirmed) {
      return;
    }

    this.gardeningService
      .deleteCareSchedule(scheduleId)
      .subscribe({

        next: () => {

          this.showSuccessToast(
            'Care schedule deleted successfully.'
          );

          this.loadAll();

        },

        error: (error) => {

          console.error(
            'Error deleting care schedule:',
            error
          );

          this.showErrorToast(
            error?.error?.error ||
            'Unable to delete the care schedule.'
          );

        }

      });
  }

  // ==============================
  // REFRESH
  // ==============================

  refresh(): void {

    this.loadTaskTypes();
    this.loadAll();

    this.showSuccessToast(
      'Gardening data refreshed.'
    );
  }

  // ==============================
  // STATUS
  // ==============================

  getStatusClass(status: string): string {

    if (!status) {
      return 'assigned';
    }

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // ==============================
  // TOAST
  // ==============================

  showSuccessToast(message: string): void {

    this.toastType = 'success';
    this.toastMessage = message;
    this.showToast = true;

    this.resetToastTimer();
  }

  showErrorToast(message: string): void {

    this.toastType = 'error';
    this.toastMessage = message;
    this.showToast = true;

    this.resetToastTimer();
  }

  closeToast(): void {

    this.showToast = false;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  private resetToastTimer(): void {

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {

      this.showToast = false;

    }, 3500);
  }

}