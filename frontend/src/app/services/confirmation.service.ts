import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  confirm(message: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(window.confirm(message));
    });
  }
}