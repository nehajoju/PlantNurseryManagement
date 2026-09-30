import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GardeningAi } from '../../services/gardening-ai';

@Component({
  selector: 'app-gardening-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './gardening-help.html',
  styleUrl: './gardening-help.css'
})
export class GardeningHelp {

  question = '';
  answer = '';
  loading = false;
  error = '';

  constructor(
    private gardeningAi: GardeningAi
  ) {}

  askQuestion(): void {

    if (!this.question.trim()) {
      this.error = 'Please enter a gardening question.';
      return;
    }

    this.loading = true;
    this.answer = '';
    this.error = '';

    this.gardeningAi
      .askQuestion(this.question.trim())
      .subscribe({

        next: (response) => {

          this.answer = response.answer;
          this.loading = false;

        },

        error: (error) => {

          console.error(error);

          this.error =
            error?.error?.error ||
            'Unable to get an answer right now. Please try again.';

          this.loading = false;

        }

      });
  }

  clearQuestion(): void {
    this.question = '';
    this.answer = '';
    this.error = '';
  }
}