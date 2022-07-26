import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Product } from 'src/app/models/data.model';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  title: any = '';
  mainProduct!: Product;

  isHomeRoute: boolean = true;
  isProductDetail: boolean = false;
  isCartClicked: boolean = false;
  isCheckout: boolean = false;
  addedProducts: any[] = [];
  totalAddedProductsPrice: number = 0;
  addedProductCountValidators = [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(99),
    Validators.min(1),
  ];

  @ViewChild('cartDialogELement', { static: true })
  cartDialogELement!: ElementRef;
  @ViewChild('cartDialogOverlay', { static: true })
  cartDialogOverlay!: ElementRef;

  productCountControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(99),
    Validators.min(1),
  ]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
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
        if (
          val.url.includes('home') ||
          val.urlAfterRedirects.includes('home')
        ) {
          this.isHomeRoute = true;
        } else {
          this.isHomeRoute = false;
        }

        if (val.url.includes('headphones')) this.title = 'headphones';
        if (val.url.includes('speakers')) this.title = 'speakers';
        if (val.url.includes('earphones')) this.title = 'earphones';
      }
    });

    this.setCartProducts();
  }

  onRouterLink(navigatedRoute: string) {
    if (navigatedRoute === 'home') {
      this.isHomeRoute = true;
    } else this.isHomeRoute = false;
  }

  onBasketClick() {
    if (this.isCartClicked) {
      this.renderer.addClass(this.cartDialogELement.nativeElement, 'hidden');
      this.renderer.addClass(this.cartDialogOverlay.nativeElement, 'hidden');
      document.body.style.overflow = 'unset';
      this.isCartClicked = false;
    } else {
      this.renderer.removeClass(this.cartDialogELement.nativeElement, 'hidden');
      this.renderer.removeClass(this.cartDialogOverlay.nativeElement, 'hidden');
      document.body.style.overflow = 'hidden';
      this.isCartClicked = true;
    }
  }

  setCartProducts() {
    this.dataService.getAddedProducts().subscribe((data: any) => {
      this.addedProducts = data;
      this.addedProducts.forEach((el) => {
        el.countControl = new FormControl(
          +el.count,
          this.addedProductCountValidators
        );

        this.productCountListener(el);
      });
      this.calculateTotalPrice();
    });
  }

  onRemoveAll() {
    this.dataService.removeAllAddedProducts();
  }

  calculateTotalPrice() {
    let count = 0;
    this.totalAddedProductsPrice = 0;
    this.addedProducts.forEach(
      (product) =>
        (this.totalAddedProductsPrice += Number(
          product.count * product.product.price
        ))
    );
  }
  onIncrease(product: any) {
    let count = product.countControl.value;
    count++;

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
    product.countControl.valueChanges.subscribe((va: any) => {
      // product.countControl.patchValue(count);
      product.count = product.countControl.value;
      this.calculateTotalPrice();
    });
  }

  onCheckout() {
    this.router.navigate(['/', 'checkout']);
    this.renderer.addClass(this.cartDialogOverlay.nativeElement, 'hidden');
    this.renderer.addClass(this.cartDialogELement.nativeElement, 'hidden');
    document.body.style.overflow = 'unset';
    this.isCartClicked = false;
  }
}
