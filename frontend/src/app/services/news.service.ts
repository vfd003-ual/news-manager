import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, forkJoin } from 'rxjs';
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
  private savedNewsCache: News[] = [];

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
    return forkJoin([
      this.http.get(`${this.apiUrl}/news`, {
        params,
        headers: this.getHeaders()
      }),
      this.getSavedNews()
    ]).pipe(
      map(([newsResponse, savedNews]) => {
        const articles = (newsResponse as any).articles || [];
        const savedUrls = new Set(savedNews.map(n => n.url));
        
        // Marcar las noticias que están guardadas
        articles.forEach((article: News) => {
          article.isSaved = savedUrls.has(article.url);
        });

        return articles;
      }),
      catchError(error => {
        console.error('Error obteniendo noticias:', error);
        return of([]);
      })
    );
  }

  setCurrentNews(news: News[]) {
    this.currentNews = news;
  }

  getCurrentNews(): News[] {
    return this.currentNews;
  }

  getNewsByUrl(url: string): News | null {
    // Buscar primero en las noticias actuales
    let news = this.currentNews.find(n => n.url === url);
    
    // Si no se encuentra, buscar en las guardadas
    if (!news && this.savedNewsCache.length > 0) {
      news = this.savedNewsCache.find(n => n.url === url);
    }
    
    return news || null;
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

  isNewsSaved(url: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/preferences/saved-news/${encodeURIComponent(url)}`,
      { headers: this.getHeaders() }
    );
  }

  getSavedNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/preferences/saved-news`, {
      headers: this.getHeaders()
    }).pipe(
      tap(news => {
        this.savedNewsCache = news; // Guardar en caché
      })
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
