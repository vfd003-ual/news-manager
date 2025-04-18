// src/app/services/preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = 'http://localhost:3000/api/preferences';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtener headers con token
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-auth-token': this.authService.getToken() || ''
    });
  }

  // Obtener todas las preferencias
  getPreferences(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  // Actualizar categorías
  updateCategories(categories: string[]): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/categories`, 
      { categories }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  // Actualizar fuentes
  updateSources(sources: string[]): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/sources`, 
      { sources }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  // Guardar/eliminar noticia
  toggleSaveNews(newsId: string, save: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/saved-news`, 
      { newsId, save }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }
}