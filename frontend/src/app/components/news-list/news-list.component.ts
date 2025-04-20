import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para ngIf, ngFor, etc.
import { RouterModule } from '@angular/router'; // Para routerLink
import { NewsFilterComponent } from '../news-filter/news-filter.component'; // Importa el componente
import { News, NewsFilter } from '../../models/news.model';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NewsFilterComponent
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
  
  constructor(private newsService: NewsService) { }
  
  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.newsService.getNews().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); // Para debug
        this.allNews = Array.isArray(data) ? data : (data?.articles || []);
        this.news = [...this.allNews];
        this.newsService.setCurrentNews(this.news);
        this.sources = Array.from(new Set(
          this.allNews
            .map(news => news.source?.name)
            .filter(source => source != null) as string[]
        )).sort();
        this.loading = false;
        console.log('Noticias procesadas:', this.news); // Para debug
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
  
  unsaveNews(news: News): void {
    this.newsService.toggleSaveNews(news, false).subscribe({
      next: () => {
        const index = this.news.findIndex(n => n.url === news.url);
        if (index !== -1) {
          this.news[index] = { ...this.news[index], isSaved: false };
          // También actualizamos el array original
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