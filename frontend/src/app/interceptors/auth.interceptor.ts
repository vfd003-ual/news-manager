import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    // Si hay token y es una petición a nuestro backend
    if (token && request.url.includes('localhost:3000')) {
      const authReq = request.clone({
        headers: request.headers.set('x-auth-token', token)
      });
      return next.handle(authReq);
    }
    
    return next.handle(request);
  }
}