import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasketService, CartItem } from 'src/app/services/basket.service';
import { AuthService } from 'src/app/services/auth.service';
import { OrderService, CheckoutRequest } from 'src/app/services/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  billingForm = new FormGroup({});
  shippingForm = new FormGroup({});
  paymentForm = new FormGroup({});

  totalPrice: number = 0;
  shippingAmount: number = 50;
  vatAmount: number = 50;
  grandTotalAmount: number = 0;

  showOtherText!: string;

  isCashOnDeliverySelected: boolean = false;
  isShowOther: boolean = false;

  basketProducts: any[] = [];
  subscriptions: Subscription[] = [];

  @ViewChild('emoneyNumber', { static: true }) emoneyNumber!: ElementRef;
  @ViewChild('emoneyPin', { static: true }) emoneyPin!: ElementRef;
  @ViewChild('pin') pin: any;
  @ViewChild('orderReceipt') orderReceipt!: ElementRef;

  constructor(
    private basketService: BasketService,
    private router: Router,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private orderService: OrderService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getBasketProducts();
    this.loadUserProfile();
    this.setupAuthListener();
  }

  initForm() {
    this.billingForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('[+][0-9|+]*'),
      ]),
    });

    this.shippingForm = new FormGroup({
      address: new FormControl('', Validators.required),
      zipCode: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(5),
        Validators.pattern('^[0-9]*$'),
      ]),
      city: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
    });

    this.paymentForm = new FormGroup({
      method: new FormControl(1),
      pin: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
    });

    this.paymentForm.get('method')?.valueChanges.subscribe((value) => {
      if (value == 1) {
        this.isCashOnDeliverySelected = false;
        this.paymentForm.get('pin')?.setValidators(Validators.required);
        this.paymentForm.get('number')?.setValidators(Validators.required);
        this.cdr.detectChanges();
      } else {
        this.isCashOnDeliverySelected = true;
        this.paymentForm.get('pin')?.clearValidators();
        this.paymentForm.get('number')?.clearValidators();
        this.paymentForm.get('pin')?.reset();
        this.paymentForm.get('number')?.reset();
      }
    });
  }

  onContinueAndPay() {
    if (
      this.billingForm.invalid ||
      this.shippingForm.invalid ||
      this.paymentForm.invalid
    ) {
      return;
    }

    // Prepare checkout request with complete data
    const shippingAddress = `${this.shippingForm.value.address}, ${this.shippingForm.value.city}, ${this.shippingForm.value.country} ${this.shippingForm.value.zipCode}`;
    const paymentMethod = this.paymentForm.value.method === 1 ? 'e-money' : 'cash-on-delivery';

    // Prepare items from basket
    const items = this.basketProducts.map(product => ({
      product_id: product.product.id,
      quantity: product.quantity,
      price: product.product.price
    }));

    // Prepare billing details
    const billingDetails = {
      name: this.billingForm.value.name,
      email: this.billingForm.value.email,
      phone: this.billingForm.value.phoneNumber
    };

    const checkoutRequest: CheckoutRequest = {
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      total_amount: this.grandTotalAmount,
      items: items,
      billing_details: billingDetails
    };

    // Create order
    this.orderService.checkout(checkoutRequest).subscribe({
      next: (order) => {
        // Show order receipt
        this.renderer.addClass(this.orderReceipt.nativeElement, 'show-receipt');
      },
      error: (error) => {
        this._snackBar.open('Error creating order. Please try again.', 'Close', {
          duration: 5000,
        });
      }
    });
  }

  getBasketProducts() {
    let totalPay: number = 0;
    const subscription = this.basketService.cartItems$.subscribe((cartItems: CartItem[]) => {
      this.basketProducts = cartItems;
      
      this.basketProducts.forEach((product) => {
        totalPay += product.quantity * product.product.price;
      });
      this.totalPrice = totalPay;
      this.vatAmount = 0.2 * this.totalPrice;
      this.grandTotalAmount =
        this.totalPrice + this.vatAmount + this.shippingAmount;
      this.showOtherText = `and ${this.basketProducts.length - 1} other item`;
    });

    this.subscriptions.push(subscription);
    
    // Load initial cart data
    this.basketService.getCartItems().subscribe();
  }

  onShowOther() {
    this.isShowOther = !this.isShowOther;
    this.showOtherText = this.isShowOther
      ? 'View less'
      : `And ${this.basketProducts.length - 1} other item`;
  }
  onBackToHome() {
    // Clear cart and navigate to home
    this.renderer.addClass(this.orderReceipt.nativeElement, 'hidden');
    this.basketService.clearCart().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        // Navigate to home even if cart clearing fails
        this.router.navigate(['/']);
      }
    });
  }

  loadUserProfile() {
    if (this.authService.isAuthenticated()) {
      const subscription = this.authService.getProfile().subscribe({
        next: (user) => {
          if (user) {
            // Pre-fill billing form with user data
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            this.billingForm.patchValue({
              name: fullName || '',
              email: user.email || '',
              phoneNumber: user.phone || ''
            });

            // Pre-fill shipping form with user address if available
            if (user.address) {
              // Try to parse address components if it's in a structured format
              const addressParts = this.parseAddress(user.address);
              this.shippingForm.patchValue({
                address: addressParts.street || user.address || '',
                city: addressParts.city || '',
                country: addressParts.country || '',
                zipCode: addressParts.zipCode || ''
              });
            }
          }
        },
        error: (error) => {
          // Don't show error to user as this is optional functionality
        }
      });

      this.subscriptions.push(subscription);
    }
  }

  private parseAddress(address: string): { street?: string; city?: string; country?: string; zipCode?: string } {
    if (!address) return {};

    // Simple address parsing - you can enhance this based on your address format
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      // Assume format: street, city, country
      return {
        street: parts[0],
        city: parts[1],
        country: parts[2]
      };
    } else if (parts.length === 2) {
      // Assume format: street, city
      return {
        street: parts[0],
        city: parts[1]
      };
    } else {
      // Single part - treat as street address
      return {
        street: address
      };
    }
  }

  private setupAuthListener() {
    // Listen for authentication changes
    const subscription = this.authService.currentUser.subscribe((user) => {
      if (!user) {
        // User logged out, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
