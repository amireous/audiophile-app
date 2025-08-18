import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/models/user.model';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup = new FormGroup({});
  avatarUrl: string | null = null;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit(): void {
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
    const profile: UserProfile | null = this.storageService.getUserProfile();
    if (profile) {
      this.profileForm.patchValue({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
      });
      this.avatarUrl = profile.avatarUrl ?? null;
    } else {
      // if user logged in via login form, try to infer a name from email
      const access = this.storageService.getItem('access');
      const email: string | undefined = access?.email;
      const inferredFirstName = email ? String(email).split('@')[0] : '';
      this.profileForm.patchValue({ firstName: inferredFirstName });
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const profile: UserProfile = {
      ...this.profileForm.value,
      avatarUrl: this.avatarUrl ?? null,
    } as UserProfile;
    this.storageService.saveUserProfile(profile);
  }

  onLogout(): void {
    this.storageService.logOutUser();
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


