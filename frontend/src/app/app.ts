import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { filter } from 'rxjs';
import { AlertPopup } from './shared/alert-popup/alert-popup';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AlertPopup,
    Navbar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})


export class App {

  protected readonly title = signal('frontend');

  isAdminRoute = false;

  constructor(
    private router: Router
  ) {

    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe(
        (event: NavigationEnd) => {

          this.isAdminRoute =
  event.urlAfterRedirects.startsWith('/admin') ||
  event.urlAfterRedirects.startsWith('/staff');

        }
      );

  }

}
