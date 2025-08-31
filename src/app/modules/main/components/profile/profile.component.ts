import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup = new FormGroup({});
  avatarUrl: string | null = null;
  currentUser: User | null = null;
  isLoading = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^\\+?[0-9\\s-]{7,15}$')]),
      address: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.first_name ?? '',
          lastName: user.last_name ?? '',
          phone: user.phone ?? '',
          address: user.address ?? '',
        });
        this.avatarUrl = user.profile_pic_url ?? null;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading profile data', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      }
    });
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const profileData = {
      first_name: this.profileForm.value.firstName,
      last_name: this.profileForm.value.lastName,
      phone: this.profileForm.value.phone,
      address: this.profileForm.value.address,
      profile_pic_url: this.avatarUrl || undefined
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 2000,
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error updating profile', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onOrders(): void {
    this.router.navigate(['/', 'orders']);
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}


