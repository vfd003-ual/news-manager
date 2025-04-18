// src/app/components/news-detail/news-detail.component.ts
// Añadir funcionalidades de guardar artículos

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit {
  news: any = null;
  isLoading: boolean = true;
  error: string = '';
  isSaved: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadNewsDetail(id);
      this.checkIfSaved(id);
    } else {
      this.router.navigate(['/news']);
    }
  }

  loadNewsDetail(id: string) {
    this.isLoading = true;
    this.newsService.getNewsById(id).subscribe({
      next: (data) => {
        this.news = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la noticia';
        this.isLoading = false;
      }
    });
  }

  checkIfSaved(id: string) {
    this.newsService.isNewsSaved(id).subscribe(isSaved => {
      this.isSaved = isSaved;
    });
  }

  toggleSave() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    const newsId = this.route.snapshot.paramMap.get('id');
    if (newsId) {
      this.newsService.toggleSaveNews(newsId, !this.isSaved).subscribe({
        next: () => {
          this.isSaved = !this.isSaved;
        },
        error: (error) => {
          console.error('Error al guardar/eliminar noticia:', error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/news']);
  }
}