import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationStateService {
  private fromSavedNewsSource = new BehaviorSubject<boolean>(false);
  fromSavedNews$ = this.fromSavedNewsSource.asObservable();

  setFromSavedNews(value: boolean) {
    this.fromSavedNewsSource.next(value);
  }
}