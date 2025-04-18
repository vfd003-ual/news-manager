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
  news: News[] = [];
  loading = true;
  currentFilter: NewsFilter = {};
  
  constructor(private newsService: NewsService) { }
  
  ngOnInit(): void {
    this.loadNews();
  }
  
  loadNews(): void {
    this.loading = true;
    this.newsService.getNews(this.currentFilter).subscribe({
      next: (data) => {
        this.news = data;
        this.loading = false;
        console.log('Noticias cargadas:', this.news); // Para debug
      },
      error: (error) => {
        console.error('Error al cargar noticias:', error);
        this.loading = false;
      }
    });
  }
  
  onFilterChange(filter: NewsFilter): void {
    this.currentFilter = filter;
    this.loadNews();
  }
  
  saveNews(news: News): void {
    this.newsService.toggleSaveNews(news.url, true).subscribe({
      next: () => {
        const index = this.news.findIndex(n => n.url === news.url);
        if (index !== -1) {
          this.news[index] = { ...this.news[index], isSaved: true };
        }
      },
      error: (error) => {
        console.error('Error al guardar noticia:', error);
      }
    });
  }
  
  unsaveNews(newsUrl: string): void {
    this.newsService.toggleSaveNews(newsUrl, false).subscribe({
      next: () => {
        const index = this.news.findIndex(n => n.url === newsUrl);
        if (index !== -1) {
          this.news[index] = { ...this.news[index], isSaved: false };
        }
      },
      error: (error) => {
        console.error('Error al quitar noticia guardada:', error);
      }
    });
  }
}