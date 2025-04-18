import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:3000/api/news'; // ← Proxy en tu backend
  private savedNewsSubject = new BehaviorSubject<string[]>([]);
  public savedNews$ = this.savedNewsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.savedNewsSubject.next(user.preferences.savedNews || []);
      } else {
        this.savedNewsSubject.next([]);
      }
    });
  }

  // Nuevo formato de headers usando 'Authorization'
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getNews(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();

    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.source)   httpParams = httpParams.set('source', params.source);
    if (params.fromDate) httpParams = httpParams.set('from', params.fromDate);
    if (params.toDate)   httpParams = httpParams.set('to', params.toDate);
    if (params.query)    httpParams = httpParams.set('q', params.query);

    return this.http.get(`${this.apiUrl}`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo noticias:', error);
        return of({ articles: [] });
      })
    );
  }

  getNewsById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo noticia:', error);
        return of(null);
      })
    );
  }

  toggleSaveNews(newsId: string, save: boolean): Observable<string[]> {
    if (this.authService.getToken()) {
      return this.http.put<any>(
        'http://localhost:3000/api/preferences/saved-news',
        { newsId, save },
        { headers: this.getHeaders() }
      ).pipe(
        tap(savedNews => this.savedNewsSubject.next(savedNews)),
        catchError(error => {
          console.error('Error actualizando noticia guardada:', error);
          return of(this.savedNewsSubject.value);
        })
      );
    } else {
      const currentSaved = [...this.savedNewsSubject.value];
      const updatedSaved = save
        ? currentSaved.includes(newsId) ? currentSaved : [...currentSaved, newsId]
        : currentSaved.filter(id => id !== newsId);

      this.savedNewsSubject.next(updatedSaved);
      return of(updatedSaved);
    }
  }

  isNewsSaved(newsId: string): Observable<boolean> {
    return this.savedNews$.pipe(
      map(savedNews => savedNews.includes(newsId))
    );
  }

  getSavedNews(): Observable<any> {
    return this.http.get('http://localhost:3000/api/preferences', {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo noticias guardadas:', error);
        return of({ savedNews: [] });
      })
    );
  }
}
