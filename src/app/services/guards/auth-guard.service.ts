import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.storageService.isLoggedIn) {
      return true;
    }
    return this.router.createUrlTree(['/auth', 'login']);
  }
}


