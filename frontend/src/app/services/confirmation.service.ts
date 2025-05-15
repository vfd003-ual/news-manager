import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  confirm(message: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (isPlatformBrowser(this.platformId)) {
        resolve(window.confirm(message));
      } else {
        resolve(false);
      }
    });
  }
}