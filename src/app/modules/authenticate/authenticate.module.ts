import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [{ path: 'login', component: LoginComponent }];

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class AuthenticateModule {}
