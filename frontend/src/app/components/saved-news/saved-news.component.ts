import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { News } from '../../models/news.model';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-saved-news',
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-news.component.html',
  styleUrl: './saved-news.component.scss'
})
export class SavedNewsComponent {
  savedNews: News[] = [];
  loading = true;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadSavedNews();
  }

  loadSavedNews(): void {
    this.loading = true;
    this.newsService.getSavedNews().subscribe({
      next: (news) => {
        this.savedNews = news;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar noticias guardadas:', error);
        this.loading = false;
      }
    });
  }

  unsaveNews(news: News): void {
    this.newsService.toggleSaveNews(news, false).subscribe({
      next: () => {
        this.savedNews = this.savedNews.filter(n => n.url !== news.url);
      },
      error: (error) => {
        console.error('Error al quitar noticia guardada:', error);
      }
    });
  }
}
