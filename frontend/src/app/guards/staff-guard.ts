import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const staffGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Admin cannot access Staff pages
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  // Only Staff can access Staff pages
  if (auth.isStaff()) {
    return true;
  }

  // Customer trying to access Staff pages
  router.navigate(['/']);
  return false;
};