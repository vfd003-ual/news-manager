import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showNotification(message: string, isError: boolean = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Añadir clase para la animación de entrada
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
}