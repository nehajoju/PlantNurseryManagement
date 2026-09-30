import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gardening as GardeningService } from '../../services/gardening';

@Component({
  selector: 'app-gardening',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './gardening.html',
  styleUrl: './gardening.css'
})
export class Gardening implements OnInit {

  availableTasks: any[] = [];
  myTasks: any[] = [];

  loading = true;
  errorMessage = '';

  actionLoading: { [key: number]: boolean } = {};

  // MODAL
  showModal = false;
  modalType: 'complete' | 'skip' = 'complete';
  selectedTaskId: number | null = null;
  modalTitle = '';
  modalDescription = '';
  modalText = '';
  modalError = '';

  // TOAST
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private toastTimer: any;

  constructor(
    private gardeningService: GardeningService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // ==========================================
  // LOAD TASKS
  // ==========================================

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.gardeningService.getAvailableTasks().subscribe({
      next: (data) => {
        this.availableTasks = Array.isArray(data)
          ? data
          : data?.results || [];

        this.loadMyTasks();
      },

      error: (error) => {
        console.error(
          'Error loading available gardening tasks:',
          error
        );

        this.errorMessage =
          error?.error?.error ||
          'Unable to load gardening tasks.';

        this.loading = false;
      }
    });
  }

  loadMyTasks(): void {
    this.gardeningService.getMyTasks().subscribe({
      next: (data) => {
        this.myTasks = Array.isArray(data)
          ? data
          : data?.results || [];

        this.loading = false;
      },

      error: (error) => {
        console.error(
          'Error loading my gardening tasks:',
          error
        );

        this.errorMessage =
          error?.error?.error ||
          'Unable to load your gardening tasks.';

        this.loading = false;
      }
    });
  }

  // ==========================================
  // CLAIM TASK
  // ==========================================

  claimTask(taskId: number): void {

    if (this.actionLoading[taskId]) {
      return;
    }

    this.actionLoading[taskId] = true;

    this.gardeningService.claimTask(taskId).subscribe({

      next: () => {

        delete this.actionLoading[taskId];

        this.showSuccessToast(
          'Gardening task claimed successfully.'
        );

        this.loadTasks();
      },

      error: (error) => {

        delete this.actionLoading[taskId];

        console.error(
          'Error claiming gardening task:',
          error
        );

        this.showErrorToast(
          error?.error?.error ||
          'Unable to claim this task.'
        );
      }
    });
  }

  // ==========================================
  // START TASK
  // ==========================================

  startTask(taskId: number): void {

    if (this.actionLoading[taskId]) {
      return;
    }

    this.actionLoading[taskId] = true;

    this.gardeningService.startTask(taskId).subscribe({

      next: () => {

        delete this.actionLoading[taskId];

        this.showSuccessToast(
          'Gardening task started.'
        );

        this.loadTasks();
      },

      error: (error) => {

        delete this.actionLoading[taskId];

        console.error(
          'Error starting gardening task:',
          error
        );

        this.showErrorToast(
          error?.error?.error ||
          'Unable to start this task.'
        );
      }
    });
  }

  // ==========================================
  // COMPLETE MODAL
  // ==========================================

  openCompleteModal(taskId: number): void {

    this.selectedTaskId = taskId;

    this.modalType = 'complete';

    this.modalTitle =
      'Complete Gardening Task';

    this.modalDescription =
      'Add any notes about the work you completed.';

    this.modalText = '';

    this.modalError = '';

    this.showModal = true;
  }

  // ==========================================
  // SKIP MODAL
  // ==========================================

  openSkipModal(taskId: number): void {

    this.selectedTaskId = taskId;

    this.modalType = 'skip';

    this.modalTitle =
      'Skip Gardening Task';

    this.modalDescription =
      'Please provide a reason for skipping this task.';

    this.modalText = '';

    this.modalError = '';

    this.showModal = true;
  }

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  closeModal(): void {

    if (
      this.selectedTaskId !== null &&
      this.actionLoading[this.selectedTaskId]
    ) {
      return;
    }

    this.showModal = false;

    this.selectedTaskId = null;

    this.modalText = '';

    this.modalError = '';
  }

  // ==========================================
  // SUBMIT MODAL
  // ==========================================

  submitModal(): void {

    if (this.selectedTaskId === null) {
      return;
    }

    const taskId = this.selectedTaskId;

    // Skip requires a reason
    if (
      this.modalType === 'skip' &&
      !this.modalText.trim()
    ) {
      this.modalError =
        'Please enter a reason for skipping this task.';

      return;
    }

    if (this.actionLoading[taskId]) {
      return;
    }

    this.modalError = '';

    this.actionLoading[taskId] = true;

    // ========================================
    // COMPLETE
    // ========================================

    if (this.modalType === 'complete') {

      this.gardeningService
        .completeTask(
          taskId,
          this.modalText.trim()
        )
        .subscribe({

          next: () => {

            delete this.actionLoading[taskId];

            this.closeModal();

            this.showSuccessToast(
              'Gardening task completed successfully.'
            );

            this.loadTasks();
          },

          error: (error) => {

            delete this.actionLoading[taskId];

            console.error(
              'Error completing gardening task:',
              error
            );

            this.modalError =
              error?.error?.error ||
              'Unable to complete this task.';
          }
        });

      return;
    }

    // ========================================
    // SKIP
    // ========================================

    this.gardeningService
      .skipTask(
        taskId,
        this.modalText.trim()
      )
      .subscribe({

        next: () => {

          delete this.actionLoading[taskId];

          this.closeModal();

          this.showSuccessToast(
            'Gardening task skipped.'
          );

          this.loadTasks();
        },

        error: (error) => {

          delete this.actionLoading[taskId];

          console.error(
            'Error skipping gardening task:',
            error
          );

          this.modalError =
            error?.error?.error ||
            'Unable to skip this task.';
        }
      });
  }

  // ==========================================
  // TOAST
  // ==========================================

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

  // ==========================================
  // HELPERS
  // ==========================================

  isActionLoading(taskId: number): boolean {

    return !!this.actionLoading[taskId];
  }

  getStatusClass(status: string): string {

    if (!status) {
      return 'assigned';
    }

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
}


