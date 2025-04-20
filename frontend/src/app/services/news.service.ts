import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { News } from '../models/news.model';
import { NewsFilter } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:3000/api'; // ← Proxy en tu backend
  private savedNewsSubject = new BehaviorSubject<string[]>([]);
  public savedNews$ = this.savedNewsSubject.asObservable();
  private currentNews: News[] = [];

  private newsSubject = new BehaviorSubject<News[]>([]);
  public news$ = this.newsSubject.asObservable();
  private hasLoadedNews = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Nuevo formato de headers usando 'Authorization'
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-auth-token': this.authService.getToken() || ''
    });
  }

  getNews(params: any = {}): Observable<any> {
    
    if (this.hasLoadedNews) {
      return of({ articles: this.currentNews });
    }
    
    let httpParams = new HttpParams();

    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.source)   httpParams = httpParams.set('source', params.source);
    if (params.fromDate) httpParams = httpParams.set('from', params.fromDate);
    if (params.toDate)   httpParams = httpParams.set('to', params.toDate);
    if (params.query)    httpParams = httpParams.set('q', params.query);

    return this.http.get(`${this.apiUrl}/news`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo noticias:', error);
        return of({ articles: [] });
      })
    );
  }

  setCurrentNews(news: News[]) {
    this.currentNews = news;
  }

  getCurrentNews(): News[] {
    return this.currentNews;
  }

  getNewsByUrl(url: string): News | undefined {
    return this.currentNews.find(news => news.url === url);
  }

  /* getNewsById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error obteniendo noticia:', error);
        return of(null);
      })
    );
  } */

  toggleSaveNews(news: News, save: boolean): Observable<News[]> {
    console.log('Intentando', save ? 'guardar' : 'quitar', 'noticia:', {
      title: news.title,
      url: news.url,
      currentState: save
    });

    return this.http.put<News[]>(
      `${this.apiUrl}/preferences/saved-news`,
      { news, save },
      { headers: this.getHeaders() }
    ).pipe(
      tap(savedNews => {
        console.log('Respuesta del servidor:', savedNews);
        // ...existing code...
        const currentNews = [...this.currentNews];
        const index = currentNews.findIndex(n => n.url === news.url);
        if (index !== -1) {
          currentNews[index] = { ...currentNews[index], isSaved: save };
          this.currentNews = currentNews;
          this.newsSubject.next(currentNews);
          console.log('Estado local actualizado:', {
            newsIndex: index,
            isSaved: save,
            totalNews: currentNews.length
          });
        }
      }),
      catchError(error => {
        console.error('Error al guardar/quitar noticia:', error);
        return throwError(() => error);
      })
    );
  }

  private updateNewsState(newsUrl: string, isSaved: boolean) {
    const currentNews = this.currentNews;
    this.currentNews = currentNews.map(news => 
      news.url === newsUrl ? { ...news, isSaved } : news
    );
    this.newsSubject.next(this.currentNews);
  }

  isNewsSaved(url: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/preferences/saved-news/${encodeURIComponent(url)}`,
      { headers: this.getHeaders() }
    );
  }

  getSavedNews(): Observable<News[]> {
    return this.http.get<News[]>(
      `${this.apiUrl}/preferences/saved-news`,
      { headers: this.getHeaders() }
    );
  }

  getFilteredNews(filter: NewsFilter): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/news`, {
      params: {
        ...(filter.source && { source: filter.source }),
        ...(filter.searchTerm && { search: filter.searchTerm })
      }
    });
  }
}
