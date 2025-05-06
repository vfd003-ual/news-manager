import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para ngIf, ngFor, etc.
import { RouterModule } from '@angular/router'; // Para routerLink
import { NewsFilterComponent } from '../news-filter/news-filter.component'; // Importa el componente
import { News, NewsFilter } from '../../models/news.model';
import { NewsService } from '../../services/news.service';
import { ScrollTopComponent } from '../scroll-top/scroll-top.component';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NewsFilterComponent,
    ScrollTopComponent
  ],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
  allNews: News[] = []; // Array con todas las noticias
  news: News[] = []; // Array con las noticias filtradas
  sources: string[] = []; // Nueva propiedad para almacenar las fuentes
  loading = true;
  currentFilter: NewsFilter = {};
  
  constructor(
    private newsService: NewsService,
    private confirmationService: ConfirmationService
  ) {}
  
  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.newsService.getNews().subscribe({
      next: (articles) => {
        this.allNews = articles;
        this.news = [...this.allNews];
        this.newsService.setCurrentNews(this.news);
        this.sources = Array.from(new Set(
          this.allNews
            .map(news => news.source?.name)
            .filter(source => source != null) as string[]
        )).sort();
        this.loading = false;
        console.log('Noticias procesadas con estado de guardado:', this.news);
      },
      error: (error) => {
        console.error('Error al cargar noticias:', error);
        this.loading = false;
        this.news = [];
      }
    });
  }
  
  onFilterChange(filter: NewsFilter): void {
    this.applyLocalFilter(filter);
  }

  private applyLocalFilter(filter: NewsFilter): void {
    let filteredNews = [...this.allNews];

    if (filter.source) {
      filteredNews = filteredNews.filter(news => 
        news.source?.name === filter.source
      );
    }

    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filteredNews = filteredNews.filter(news =>
        (news.title?.toLowerCase().includes(searchTerm) ?? false) ||
        (news.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    this.news = filteredNews;
  }
  
  saveNews(news: News): void {
    this.newsService.toggleSaveNews(news, true).subscribe({
      next: () => {
        const index = this.news.findIndex(n => n.url === news.url);
        if (index !== -1) {
          this.news[index] = { ...this.news[index], isSaved: true };
          // También actualizamos el array original
          const allNewsIndex = this.allNews.findIndex(n => n.url === news.url);
          if (allNewsIndex !== -1) {
            this.allNews[allNewsIndex] = { ...this.allNews[allNewsIndex], isSaved: true };
          }
        }
      },
      error: (error) => {
        console.error('Error al guardar noticia:', error);
      }
    });
  }
  
  async unsaveNews(news: News): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `¿Estás seguro de que deseas eliminar "${news.title}" de tus noticias guardadas?`
    );

    if (confirmed) {
      this.newsService.toggleSaveNews(news, false).subscribe({
        next: () => {
          const index = this.news.findIndex(n => n.url === news.url);
          if (index !== -1) {
            this.news[index] = { ...this.news[index], isSaved: false };
            const allNewsIndex = this.allNews.findIndex(n => n.url === news.url);
            if (allNewsIndex !== -1) {
              this.allNews[allNewsIndex] = { ...this.allNews[allNewsIndex], isSaved: false };
            }
          }
        },
        error: (error) => {
          console.error('Error al quitar noticia guardada:', error);
        }
      });
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'image-error';
      errorDiv.textContent = 'Imagen no disponible';
      parent.appendChild(errorDiv);
    }
  }
}