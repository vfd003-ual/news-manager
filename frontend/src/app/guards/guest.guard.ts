import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const guestGuard = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated$.pipe(
    first(), // Usar first() en lugar de take(1)
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }
      
      // En lugar de createUrlTree, usar navegación con skipLocationChange
      router.navigateByUrl('/news', { skipLocationChange: true }).then(() => {
        window.history.replaceState({}, '', '/news');
      });
      
      return false;
    })
  );
};