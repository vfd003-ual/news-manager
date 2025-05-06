import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News } from '../../models/news.model';
import { NavigationStateService } from '../../services/navigation-state.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit, OnDestroy {
  news: News | null = null;
  isLoading: boolean = true;
  error: string = '';
  isSaved: boolean = false;
  isAuthenticated: boolean = false;
  isFromSavedNews: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private authService: AuthService,
    private navigationState: NavigationStateService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => this.isAuthenticated = isAuthenticated
    );

    // Suscribirse al estado de navegación
    this.navigationState.fromSavedNews$.subscribe(
      fromSaved => {
        this.isFromSavedNews = fromSaved;
        console.log('Is from saved news:', fromSaved);
      }
    );
    
    this.route.params.subscribe(params => {
      const url = params['url'];
      if (url) {
        this.loadNewsDetail(url);
        this.checkIfSaved(url);
      } else {
        this.router.navigate(['/news']);
      }
    });
  }

  ngOnDestroy() {
    // Reset the navigation state when leaving the component
    this.navigationState.setFromSavedNews(false);
    console.log('Navigation state reset on destroy');
  }

  loadNewsDetail(url: string) {
    this.isLoading = true;
    
    let foundNews = this.newsService.getNewsByUrl(url);
    
    if (!foundNews) {
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

    this.newsService.toggleSaveNews(this.news, !this.isSaved).subscribe({
      next: () => {
        this.isSaved = !this.isSaved;
        console.log('Toggle save:', {isSaved: this.isSaved, isFromSavedNews: this.isFromSavedNews});
        
        if (!this.isSaved && this.isFromSavedNews) {
          this.navigationState.setFromSavedNews(false);
          this.router.navigate(['/saved-news']);
        }
      },
      error: (error) => {
        console.error('Error al guardar/quitar la noticia:', error);
      }
    });
  }

  goBack() {
    // No need to reset here since ngOnDestroy will handle it
    if (this.isFromSavedNews) {
      this.router.navigate(['/saved-news']);
    } else {
      this.router.navigate(['/news']);
    }
  }
}