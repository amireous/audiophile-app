import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
            this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Access denied. Admin privileges required.', 'Close', { duration: 3000 });
            this.authService.logout();
          }
        },
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
