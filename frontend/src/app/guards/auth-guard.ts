import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  // User is not logged in
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Admin should not access customer pages
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  // Staff should not access customer pages
  if (auth.isStaff()) {
    router.navigate(['/staff']);
    return false;
  }

  // Only Customer can access these routes
  return true;
};
