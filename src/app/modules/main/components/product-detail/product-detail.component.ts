import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/data.model';
import { ProductDetailService, ProductDetailResponse } from 'src/app/services/product-detail.service';
import { BasketService, AddToCartRequest } from 'src/app/services/basket.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  productDetail!: ProductDetailResponse;
  loading = false;
  error: string | null = null;

  productCount!: number;
  innerWidth!: number;
  productCountControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(99),
    Validators.min(1),
  ]);

  constructor(
    private route: ActivatedRoute,
    private productDetailService: ProductDetailService,
    private basketService: BasketService,
    private _snackbar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.route.params.subscribe((params) => {
      this.getProduct(params.slug);
    });
  }

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  getProduct(productId: number) {
    this.loading = true;
    this.error = null;
    
    this.productDetailService.getProductById(productId).subscribe({
      next: (product) => {
        this.productDetail = product;
        this.loading = false;
        
        // Mark product as recently viewed if user is logged in
        if (this.authService.isAuthenticated()) {
          this.productDetailService.markAsRecentlyViewed(product.id).subscribe();
        }
      },
      error: (error) => {
        this.error = 'Product not found or error loading product details';
        this.loading = false;
        this._snackbar.open('Error loading product details', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onIncrease() {
    let count = this.productCountControl.value;
    count++;

    if (count > 99) {
      count = 0;
    }

    this.productCountControl.patchValue(count);
  }

  onDecrease() {
    let count = this.productCountControl.value;
    count--;

    if (count < 1) {
      count = 1;
    }
    this.productCountControl.patchValue(count);
  }

  onAddToCart() {
    if (!this.authService.isAuthenticated()) {
      this._snackbar.open('Please login to add items to cart', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (!this.productDetail || !this.productCountControl.value) {
      this._snackbar.open('Please select a quantity', 'Close', {
        duration: 3000,
      });
      return;
    }

    const request: AddToCartRequest = {
      product_id: this.productDetail.id,
      quantity: Number(this.productCountControl.value)
    };

    this.basketService.addToCart(request).subscribe({
      next: (response) => {
        this._snackbar.open(response.message || `Item ${this.productDetail.name} added to cart`, 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar'],
        });
        this.productCountControl.reset();
      },
      error: (error) => {
        this._snackbar.open('Error adding item to cart. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    });
  }
}
