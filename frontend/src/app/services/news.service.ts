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
  private apiUrl = 'http://localhost:3000/api';
  private savedNewsSubject = new BehaviorSubject<string[]>([]);
  public savedNews$ = this.savedNewsSubject.asObservable();
  private currentNews: News[] = [];
  private savedNewsCache: News[] = [];
  private newsSubject = new BehaviorSubject<News[]>([]);
  public news$ = this.newsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-auth-token': this.authService.getToken() || ''
    });
  }

  // Método para obtener noticias de la API externa
  private getExternalNews(params: any = {}): Observable<News[]> {
    return this.http.get<{articles: News[]}>(`${this.apiUrl}/news`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.articles || []),
      catchError(error => {
        console.error('Error obteniendo noticias externas:', error);
        return of([]);
      })
    );
  }

  // Método para obtener noticias del scraping
  private getScrapedNews(): Observable<News[]> {
    return this.http.get<{articles: News[]}>(`${this.apiUrl}/news/local`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.articles || []),
      catchError(error => {
        console.error('Error obteniendo noticias locales:', error);
        return of([]);
      })
    );
  }

  // Método principal que combina todas las fuentes de noticias
  getNews(filter?: NewsFilter): Observable<News[]> {
    return forkJoin({
      external: this.getExternalNews(filter),
      scraped: this.getScrapedNews(),
      saved: this.getSavedNews()
    }).pipe(
      map(({external, scraped, saved}) => {
        // Combinar todas las noticias
        const allNews = [...external, ...scraped];
        
        // Crear un Set con las URLs de las noticias guardadas
        const savedUrls = new Set(saved.map(n => n.url));
        
        // Marcar las noticias guardadas y añadir fuente para las scrapeadas
        allNews.forEach(news => {
          news.isSaved = savedUrls.has(news.url);
          if (news.source?.id === 'diario-almeria') {
            news.isLocal = true; // Marcar noticias locales
          }
        });

        // Actualizar el estado
        this.currentNews = allNews;
        this.newsSubject.next(allNews);
        
        return allNews;
      }),
      catchError(error => {
        console.error('Error obteniendo noticias:', error);
        return of([]);
      })
    );
  }

  // Método para filtrar noticias localmente
  filterNews(filter: NewsFilter): News[] {
    return this.currentNews.filter(news => {
      if (filter.source && news.source?.name !== filter.source) {
        return false;
      }
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        return (
          news.title?.toLowerCase().includes(searchLower) ||
          news.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
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
}
