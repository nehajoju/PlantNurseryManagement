import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffNavbar } from '../staff-navbar/staff-navbar';

@Component({
  selector: 'app-staff-layout',
  imports: [
    RouterOutlet,
    StaffNavbar
  ],
  templateUrl: './staff-layout.html',
  styleUrl: './staff-layout.css'
})
export class StaffLayout {}
