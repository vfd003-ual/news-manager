import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'news/:url',
    renderMode: RenderMode.Client // Usar modo cliente para rutas dinámicas
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
