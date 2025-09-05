import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
      // Skip error handling for auth endpoints (login, register, refresh)
      if (req.url.includes('/auth/login') || 
          req.url.includes('/auth/register') || 
          req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      // Handle 401 Unauthorized and 403 Forbidden - Token expired or invalid
      if ((error.status === 401 || error.status === 403) && this.authService.isAuthenticated()) {
        // Check if the error message indicates token expiration
        const isTokenError = error.error?.message?.includes('token') || 
                           error.error?.message?.includes('expired') ||
                           error.error?.message?.includes('Invalid');
        
        if (isTokenError && !this.refreshTokenInProgress && this.authService.getToken()) {
          this.refreshTokenInProgress = true;
          
          return this.authService.refreshToken().pipe(
            switchMap((response: any) => {
              this.refreshTokenInProgress = false;
              
              // Clone the request with new token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });
              
              return next.handle(newReq);
            }),
            catchError((refreshError) => {
              this.refreshTokenInProgress = false;
              
              // Refresh failed, logout user and navigate to login
              this.authService.logout();
              this.router.navigate(['/auth/login']);
              
              this.snackBar.open('Session expired. Please login again.', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              
              return throwError(() => refreshError);
            })
          );
        } else if (isTokenError) {
          // No refresh token available or token error, logout user
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          
          this.snackBar.open('Authentication required. Please login.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        } else {
          // 403 error but not token-related (insufficient permissions)
          this.snackBar.open('Access denied. Insufficient permissions.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }



      // Handle 404 Not Found
      if (error.status === 404) {
        this.snackBar.open('Resource not found.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }

      // Handle 400 Bad Request - Validation errors
      if (error.status === 400) {
        let errorMessage = 'Invalid request data.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          errorMessage = error.error.errors.map((err: any) => err.msg).join(', ');
        } else if (typeof error.error === 'object') {
          const messages: string[] = [];
          for (const field in error.error) {
            if (error.error[field]) {
              if (typeof error.error[field] === 'string') {
                messages.push(`${field}: ${error.error[field]}`);
              } else if (Array.isArray(error.error[field])) {
                messages.push(`${field}: ${error.error[field].join(', ')}`);
              }
            }
          }
          errorMessage = messages.join(', ');
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }

      // Handle 500 Internal Server Error
      if (error.status === 500) {
        this.snackBar.open('Server error. Please try again later.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }

      // Handle network errors
      if (error.error instanceof ErrorEvent) {
        this.snackBar.open('Network error. Please check your connection.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }

      // Handle other errors
      if (error.status !== 401 && error.status !== 403 && error.status !== 404 && 
          error.status !== 400 && error.status !== 500) {
        this.snackBar.open('An unexpected error occurred. Please try again.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }

      return throwError(() => error);
    })
  );
  }
}
