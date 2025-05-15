import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  // Estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadToken();
  }

  // Carga el token y verifica al usuario al iniciar la aplicacion
  loadToken() {
  if (isPlatformBrowser(this.platformId) && localStorage) {
    const token = localStorage.getItem(this.tokenKey);
    
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      this.userSubject.next(null);
      return;
    }

    this.getUserInfo().subscribe({
      next: (user) => {
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        if (window.location.pathname === '/login' || window.location.pathname === '/register') {
          this.router.navigate(['/news']);
        }
      },
      error: () => {
        localStorage.removeItem(this.tokenKey);
        this.userSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
      }
    });
  }
}

  // Registro de usuario
  register(userData: { name: string; email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        this.getUserInfo().subscribe(user => {
          this.userSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/news']);
        });
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Inicio de sesion
  login(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        this.getUserInfo().subscribe(user => {
          this.userSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/news']);
        });
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Obtener informacion del usuario
  getUserInfo(): Observable<User> {
    const headers = new HttpHeaders({
      'x-auth-token': localStorage.getItem(this.tokenKey) || ''
    });
    
    return this.http.get<User>(`${this.apiUrl}/user`, { headers }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  // Actualizar preferencias del usuario
  updateUserPreferences(preferences: any): Observable<User> {
    const headers = new HttpHeaders({
      'x-auth-token': localStorage.getItem(this.tokenKey) || ''
    });
    
    return this.http.put<User>(`${this.apiUrl}/preferences`, preferences, { headers }).pipe(
      tap(updatedUser => {
        this.userSubject.next(updatedUser);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Actualizar perfil del usuario
  updateUserProfile(userData: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user`, userData, {
      headers: new HttpHeaders({
        'x-auth-token': this.getToken() || ''
      })
    }).pipe(
      tap(updatedUser => {
        this.userSubject.next(updatedUser);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Cerrar sesion
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}