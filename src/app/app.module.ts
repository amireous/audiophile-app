import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    OnlyNumberDirective,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatBadgeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    OnlyNumberDirective
  ]
})
export class AppModule {}
