import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Components
import { CheckoutComponent } from './components/checkout/checkout.component';
import { HomeComponent } from './components/home/home.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { WrapperComponent } from './components/wrapper/wrapper.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OrdersComponent } from './components/orders/orders.component';
import { AuthGuardService } from 'src/app/services/guards/auth-guard.service';

// Directives
const routes: Routes = [
  {
    path: '',
    component: WrapperComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuardService] },
      { path: 'headphones', component: HomeComponent },
      { path: 'speakers', component: HomeComponent },
      { path: 'earphones', component: HomeComponent },
      { path: 'product-detail/:slug', component: ProductDetailComponent },
    ],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuardService] },
  // {
  //   path: '**',
  //   pathMatch: 'full',
  //   redirectTo: '',
  // },
];

@NgModule({
  declarations: [
    CheckoutComponent,
    HomeComponent,
    ProductDetailComponent,
    WrapperComponent,
    HeaderComponent,
    FooterComponent,
    ProfileComponent,
    OrdersComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild(routes),
  ],
})
export class MainModule {}
