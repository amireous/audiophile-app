import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    return '';
  }

  submitForm(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please enter username and password', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;
    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Login successful!', 'Close', {
          duration: 2000,
        });
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
        });
      }
    });
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}
