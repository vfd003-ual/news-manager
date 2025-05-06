import { Routes } from '@angular/router';
import { NewsListComponent } from './components/news-list/news-list.component';
import { NewsDetailComponent } from './components/news-detail/news-detail.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { SavedNewsComponent } from './components/saved-news/saved-news.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/news', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [guestGuard]
  },
  { 
    path: 'news', 
    component: NewsListComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'news/:url', 
    component: NewsDetailComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: UserProfileComponent, 
    canActivate: [authGuard]
  },
  {
    path: 'saved-news',
    component: SavedNewsComponent,
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: '/news'
  }
];