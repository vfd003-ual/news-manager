import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit {
  news: News | null = null;
  isLoading: boolean = true;
  error: string = '';
  isSaved: boolean = false;
  isAuthenticated: boolean = false;
  private isFromSavedNews: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => this.isAuthenticated = isAuthenticated
    );
    
    this.route.params.subscribe(params => {
      const url = params['url'];
      if (url) {
        // Verificar si venimos de la página de noticias guardadas
        this.isFromSavedNews = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString().includes('saved-news') || false;
        this.loadNewsDetail(url);
        this.checkIfSaved(url);
      } else {
        this.router.navigate(['/news']);
      }
    });
  }

  loadNewsDetail(url: string) {
    this.isLoading = true;
    
    // Primero buscar en las noticias actuales
    let foundNews = this.newsService.getNewsByUrl(url);
    
    if (!foundNews) {
      // Si no se encuentra en las noticias actuales, buscar en las guardadas
      this.newsService.getSavedNews().subscribe({
        next: (savedNews) => {
          foundNews = savedNews.find(news => news.url === url) ?? null;
          if (foundNews) {
            this.news = foundNews;
            this.isLoading = false;
          } else {
            this.error = 'Noticia no encontrada';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error al cargar noticias guardadas:', error);
          this.error = 'Error al cargar la noticia';
          this.isLoading = false;
        }
      });
    } else {
      this.news = foundNews;
      this.isLoading = false;
    }
}

  checkIfSaved(url: string) {
    this.newsService.getSavedNews().subscribe({
      next: (savedNews) => {
        this.isSaved = savedNews.some(news => news.url === url);
      },
      error: (error) => {
        console.error('Error al verificar si la noticia está guardada:', error);
      }
    });
  }

  toggleSave() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.news) return;
    
    const action = this.isSaved ? 
      this.newsService.toggleSaveNews(this.news, false) :
      this.newsService.toggleSaveNews(this.news, true);

    action.subscribe({
      next: () => {
        this.isSaved = !this.isSaved;
        
        // Si estamos quitando la noticia y venimos de saved-news, volvemos a ella
        if (!this.isSaved && this.isFromSavedNews) {
          this.router.navigate(['/saved-news']);
        }
      },
      error: (error) => {
        console.error('Error al guardar/quitar la noticia:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/news']);
  }
}