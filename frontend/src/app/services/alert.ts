import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'confirm';

export interface AlertData {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertSubject =
    new BehaviorSubject<AlertData | null>(null);

  alert$ = this.alertSubject.asObservable();

  private resolveConfirm:
    ((value: boolean) => void) | null = null;

  show(
    type: AlertType,
    title: string,
    message: string
  ): void {

    this.alertSubject.next({
      type,
      title,
      message
    });
  }

  success(
    message: string,
    title: string = 'Success'
  ): void {

    this.show(
      'success',
      title,
      message
    );
  }

  error(
    message: string,
    title: string = 'Something went wrong'
  ): void {

    this.show(
      'error',
      title,
      message
    );
  }

  warning(
    message: string,
    title: string = 'Warning'
  ): void {

    this.show(
      'warning',
      title,
      message
    );
  }

  info(
    message: string,
    title: string = 'Information'
  ): void {

    this.show(
      'info',
      title,
      message
    );
  }

  confirm(
    message: string,
    title: string = 'Are you sure?',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {

    return new Promise((resolve) => {

      this.resolveConfirm = resolve;

      this.alertSubject.next({

        type: 'confirm',

        title,

        message,

        confirmText,

        cancelText

      });

    });
  }

  close(): void {

    this.alertSubject.next(null);

  }

  confirmResult(value: boolean): void {

    if (this.resolveConfirm) {

      this.resolveConfirm(value);

      this.resolveConfirm = null;

    }

    this.alertSubject.next(null);

  }
}
