import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { News } from '../../models/news.model';
import { NewsService } from '../../services/news.service';
import { NavigationStateService } from '../../services/navigation-state.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-saved-news',
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-news.component.html',
  styleUrl: './saved-news.component.scss'
})
export class SavedNewsComponent implements OnInit {
  savedNews: News[] = [];
  loading = true;

  constructor(
    private newsService: NewsService,
    private router: Router,
    public navigationState: NavigationStateService,
    private confirmationService: ConfirmationService
  ) {}

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

  async unsaveNews(news: News): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `¿Estás seguro de que deseas eliminar "${news.title}" de tus noticias guardadas?`
    );

    if (confirmed) {
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

  navigateToDetail(news: News): void {
    this.navigationState.setFromSavedNews(true);
    this.router.navigate(['/news', news.url]);
  }
}
