import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated$.pipe(
    first(), // first() completa el observable inmediatamente después de emitir
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      // En lugar de usar createUrlTree, que causa el parpadeo,
      // podemos programar la navegación de manera diferente
      router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
        window.history.replaceState({}, '', '/login');
      });
      
      // Retornamos false para evitar la navegación original
      return false;
    })
  );
};