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
import { DataService } from 'src/app/services/data/data.service';
import { StorageService } from 'src/app/services/storage.service';
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
    private dataService: DataService,
    private localStorage: StorageService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.routeListener();
    this.setCartProducts();
    this.checkLoginStatus();
  }

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  @HostListener('window:storage', ['$event']) onStorageChange(
    event: StorageEvent
  ) {
    if (event.key === 'access') {
      this.checkLoginStatus();
    }
  }

  onRouterLink(navigatedRoute: string) {
    if (navigatedRoute === 'home') {
      this.isHomeRoute = true;
    } else this.isHomeRoute = false;
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
    this.isLoggedIn = this.localStorage.isLoggedIn;
  }

  onProfileClick(): void {
    // Handle profile click - you can add navigation to profile page or show profile menu
    console.log('Profile clicked');
    // Example: this.router.navigate(['/profile']);
  }

  onLogoutClick(): void {
    // Handle logout click
    this.localStorage.logOutUser();
    this.checkLoginStatus();
  }

  setCartProducts() {
    const subscription = this.dataService
      .getAddedProducts()
      .subscribe((data: any) => {
        this.addedProductsCount = 0;
        this.addedProducts = data;
        this.addedProducts.forEach((el) => {
          el.countControl = new FormControl(
            +el.count,
            this.addedProductCountValidators
          );

          this.addedProductsCount += Number(el.count);

          this.productCountListener(el);
        });
        this.calculateTotalPrice();
      });

    this.subscriptions.push(subscription);
  }

  onRemoveAll() {
    this.dataService.removeAllAddedProducts();
  }

  calculateTotalPrice() {
    let count = 0;
    this.totalAddedProductsPrice = 0;
    this.addedProductsCount = 0;
    this.addedProducts.forEach((product) => {
      this.totalAddedProductsPrice += Number(
        product.count * product.product.price
      );

      this.addedProductsCount += Number(product.count);
    });
  }
  onIncrease(product: any) {
    let count = product.countControl.value;
    count++;

    this.addedProductsCount++;

    if (count > 99) {
      count = 0;
    }
    product.countControl.patchValue(count);
    product.count = count;
    this.calculateTotalPrice();
  }

  onDecrease(product: any) {
    let count = product.countControl.value;
    count--;

    if (count < 1) {
      count = 1;
    }
    product.countControl.patchValue(count);
    product.count = count;
    this.calculateTotalPrice();
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
    this.dataService.removeProductFromBasket(product);
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
        this.currentPath = val.url === '/' ? val.urlAfterRedirects : val.url;
        if (
          val.url.includes('checkout') ||
          val.urlAfterRedirects.includes('checkout')
        ) {
          this.isCheckout = true;
        } else this.isCheckout = false;
        if (
          val.url.includes('product-detail') ||
          val.urlAfterRedirects.includes('product-detail')
        )
          this.isProductDetail = true;
        else this.isProductDetail = false;
        if (val.url == '/' || val.urlAfterRedirects == '/') {
          this.isHomeRoute = true;
        } else {
          this.isHomeRoute = false;
          this.isMenuBarClicked = false;

          this.renderer.removeClass(
            this.overlay.nativeElement,
            'activated-overlay'
          );
        }

        if (val.url.includes('headphones')) this.title = 'headphones';
        if (val.url.includes('speakers')) this.title = 'speakers';
        if (val.url.includes('earphones')) this.title = 'earphones';
        if(val.url == '/') {
          this.currentPath = 'home';
        }
        console.log('Current Path:', this.currentPath);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
