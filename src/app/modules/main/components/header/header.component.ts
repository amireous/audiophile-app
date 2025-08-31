import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/data.model';
import { BasketService, CartItem } from 'src/app/services/basket.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  title: any = '';
  mainProduct!: Product;
  currentPath: string = 'home';

  totalAddedProductsPrice: number = 0;
  addedProductsCount: number = 0;
  innerWidth!: number;

  addedProducts: any[] = [];
  subscriptions: Subscription[] = [];

  isMenuBarClicked: boolean = false;
  isHomeRoute: boolean = true;
  isProductDetail: boolean = false;
  isCartClicked: boolean = false;
  isCheckout: boolean = false;
  isLoggedIn: boolean = false;
  basketData: any[] = []
  @ViewChild('cartDialogELement', { static: true })
  cartDialogELement!: ElementRef;
  @ViewChild('cartDialogOverlay', { static: true })
  cartDialogOverlay!: ElementRef;
  @ViewChild('overlay', { static: true }) overlay!: ElementRef;
  @ViewChild('menuBar', { static: true }) menuBar!: ElementRef;

  productCountControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(99),
    Validators.min(1),
  ]);
  addedProductCountValidators = [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(99),
    Validators.min(1),
  ];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private basketService: BasketService,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.routeListener();
    this.setCartProducts();
    this.checkLoginStatus();
    
    // Subscribe to authentication changes
    const authSubscription = this.authService.currentUser.subscribe(() => {
      this.checkLoginStatus();
    });
    this.subscriptions.push(authSubscription);
    
    // Set initial route state for page reloads
    this.setInitialRouteState();
  }

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  @HostListener('window:storage', ['$event']) onStorageChange(
    event: StorageEvent
  ) {
    if (event.key === 'access_token') {
      this.checkLoginStatus();
    }
  }

  onRouterLink(navigatedRoute: string) {
    // This method is called when user clicks navigation links
    // The actual route state will be updated by the routeListener
    // So we don't need to manually set isHomeRoute here
  }

  onBasketClick() {
    if (!this.isLoggedIn) {
      this._snackBar.open('Please login to view your cart', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (this.isCartClicked) {
      this.closeCartDialog();
    } else {
      this.openCartDialog();
      // Load basket data when dialog opens
      this.loadBasketData();
    }
  }

  onOverlayClick(event: Event) {
    // Only close if clicking directly on the overlay, not on the dialog
    if (event.target === this.cartDialogOverlay.nativeElement) {
      this.closeCartDialog();
    }
  }

  private openCartDialog(): void {
    this.renderer.addClass(
      this.cartDialogELement.nativeElement,
      'show-dialog-cart'
    );
    this.renderer.addClass(
      this.cartDialogOverlay.nativeElement,
      'show-dialog-overlay'
    );
    this.isCartClicked = true;
  }

  private closeCartDialog(): void {
    this.renderer.removeClass(
      this.cartDialogELement.nativeElement,
      'show-dialog-cart'
    );
    this.renderer.removeClass(
      this.cartDialogOverlay.nativeElement,
      'show-dialog-overlay'
    );
    this.isCartClicked = false;
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();

  }

  onProfileClick(): void {
    this.router.navigate(['/', 'profile']);
  }

  onLogoutClick(): void {
    // Handle logout click
    this.authService.logout();
    this.checkLoginStatus();
    this._snackBar.open('Logged out successfully', 'Close', {
      duration: 2000,
    });
    
    // If user is on checkout page, redirect to login
    if (this.isCheckout) {
      this.router.navigate(['/auth/login']);
    }
  }

  setCartProducts() {
    const subscription = this.basketService.cartItems$.subscribe((cartItems: CartItem[]) => {
      this.addedProductsCount = 0;
      this.addedProducts = cartItems.map(item => ({
        product: item.product,
        count: item.quantity,
        countControl: new FormControl(item.quantity, this.addedProductCountValidators)
      }));
      
      this.addedProducts.forEach((el) => {
        this.addedProductsCount += Number(el.count);
        this.productCountListener(el);
      });
      this.calculateTotalPrice();
    });

    this.subscriptions.push(subscription);
  }

  loadBasketData() {
    // Call the basket API to get current cart data
    this.basketService.getCartItems().subscribe({
      next: (response: any) => {
        this.basketData = response;

        this.calculateTotalPrice();
      },
      error: (error) => {

        this._snackBar.open('Error loading cart data', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onRemoveAll() {
    this.basketService.clearCart().subscribe({
      next: () => {
        this._snackBar.open('All items removed from cart', 'Close', {
          duration: 2000,
        });
        // Reload basket data to update the UI
        this.loadBasketData();
      },
      error: (error) => {

        this._snackBar.open('Error clearing cart', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  calculateTotalPrice() {
    this.totalAddedProductsPrice = 0;
    this.addedProductsCount = 0;
    this.basketData.forEach((product) => {
      this.totalAddedProductsPrice += Number(
        product.quantity * product.product.price
      );
      this.addedProductsCount += Number(product.quantity);
    });
  }
  onIncrease(product: any) {
    let count = product.quantity;
    count++;

    if (count > 99) {
      count = 99;
    }
    
    // Update quantity via API
    this.basketService.updateCartItemQuantity(product.product_id, count).subscribe({
      next: () => {
        // Reload basket data to update the UI
        this.loadBasketData();
      },
      error: (error) => {
        this._snackBar.open('Error updating quantity', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onDecrease(product: any) {
    let count = product.quantity;
    count--;

    if (count < 1) {
      count = 1;
    }
    
    // Update quantity via API
    this.basketService.updateCartItemQuantity(product.product_id, count).subscribe({
      next: () => {
        // Reload basket data to update the UI
        this.loadBasketData();
      },
      error: (error) => {
        this._snackBar.open('Error updating quantity', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  productCountListener(product: any) {
    const subscription = product.countControl.valueChanges.subscribe(() => {
      product.count = product.countControl.value;
      this.calculateTotalPrice();
    });

    this.subscriptions.push(subscription);
  }

  onCheckout() {
    this.router.navigate(['/', 'checkout']);
    this.closeCartDialog();
  }

  onRemoveSingleProduct(product: any) {
    this.basketService.removeFromCart(product.product_id).subscribe({
      next: () => {
        this._snackBar.open('Item removed from cart', 'Close', {
          duration: 2000,
        });
        // Reload basket data to update the UI
        this.loadBasketData();
      },
      error: (error) => {
        this._snackBar.open('Error removing item from cart', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onCountChange(product: any, newQuantity: any) {
    const quantity = Number(newQuantity);
    if (isNaN(quantity) || quantity < 1) return;
    if (quantity > 99) return;
    
    this.basketService.updateCartItemQuantity(product.product_id, quantity).subscribe({
      next: () => {
        // Reload basket data to update the UI
        this.loadBasketData();
      },
      error: (error) => {
        this._snackBar.open('Error updating quantity', 'Close', { duration: 3000 });
      }
    });
  }

  onMenuBar() {
    this.isMenuBarClicked = !this.isMenuBarClicked;
    if (this.isMenuBarClicked) {
      this.renderer.addClass(this.overlay.nativeElement, 'activated-overlay');
    } else {
      this.renderer.removeClass(
        this.overlay.nativeElement,
        'activated-overlay'
      );
    }
  }

  routeListener() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.updateRouteState(val.url, val.urlAfterRedirects);
      }
    });
  }

  private setInitialRouteState() {
    const currentUrl = this.router.url;
    this.updateRouteState(currentUrl, currentUrl);
  }

  private updateRouteState(url: string, urlAfterRedirects: string) {
    this.currentPath = url === '/' ? urlAfterRedirects : url;
    
    // Check for checkout page
    if (url.includes('checkout') || urlAfterRedirects.includes('checkout')) {
      this.isCheckout = true;
    } else {
      this.isCheckout = false;
    }
    
    // Check for product detail page
    if (url.includes('product-detail') || urlAfterRedirects.includes('product-detail')) {
      this.isProductDetail = true;
    } else {
      this.isProductDetail = false;
    }
    
    // Check for home route
    if (url === '/' || urlAfterRedirects === '/') {
      this.isHomeRoute = true;
      this.currentPath = 'home';
    } else {
      this.isHomeRoute = false;
      this.isMenuBarClicked = false;
      this.renderer.removeClass(this.overlay.nativeElement, 'activated-overlay');
    }

    // Set category titles
    if (url.includes('headphones')) {
      this.title = 'headphones';
    } else if (url.includes('speakers')) {
      this.title = 'speakers';
    } else if (url.includes('earphones')) {
      this.title = 'earphones';
    } else {
      this.title = '';
    }
    
    
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
