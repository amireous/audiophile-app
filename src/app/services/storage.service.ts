import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private _router: Router) {}

  getItem(item: any) {
    try {
      return JSON.parse(localStorage.getItem(item) || '');
    } catch (e) {
      // localStorage.clear();
    }
  }

  setItem(item: string, data: any) {
    localStorage.setItem(item, JSON.stringify(data));
  }

  deleteItem(item: any) {
    localStorage.removeItem(item);
  }

  get isLoggedIn() {
    return !!localStorage.getItem('access');
  }

  logOutUser() {
    localStorage.clear();
    this._router.navigate(['/auth/login']);
  }
}
