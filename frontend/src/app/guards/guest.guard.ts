import { inject, PLATFORM_ID } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const guestGuard = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  
  return authService.isAuthenticated$.pipe(
    first(),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Creamos un UrlTree para la navegación
      const newsUrl = router.createUrlTree(['/news']);
      
      // Solo manipulamos el history en el navegador
      if (isPlatformBrowser(platformId)) {
        router.navigateByUrl('/news', { skipLocationChange: true }).then(() => {
          window.history.replaceState({}, '', '/news');
        });
      }
      
      return newsUrl;
    })
  );
};