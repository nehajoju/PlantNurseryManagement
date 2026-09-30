import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertData } from '../../services/alert';

@Component({
  selector: 'app-alert-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-popup.html',
  styleUrl: './alert-popup.css'
})
export class AlertPopup {

  alert: AlertData | null = null;

  constructor(
    private alertService: AlertService
  ) {

    this.alertService.alert$.subscribe(
      (data) => {
        this.alert = data;
      }
    );

  }

  close(): void {

    this.alertService.close();

  }

  confirm(value: boolean): void {

    this.alertService.confirmResult(value);

  }

  getIcon(): string {

    if (!this.alert) {
      return '';
    }

    switch (this.alert.type) {

      case 'success':
        return '✓';

      case 'error':
        return '✕';

      case 'warning':
        return '⚠';

      case 'info':
        return 'ℹ';

      case 'confirm':
        return '?';

      default:
        return 'ℹ';
    }
  }

}
