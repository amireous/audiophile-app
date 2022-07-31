import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
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
    private dataService: DataService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getBasketProducts();
  }

  ngAfterViewInit(): void {
    // console.log(this.emoneyNumber.nativeElement);
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
      console.log(value);
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

    this.shippingForm.controls['zipCode'].valueChanges.subscribe((val) => {
      console.log(this.shippingForm.controls['zipCode'].errors);
    });
  }

  onContinueAndPay() {
    if (
      this.billingForm.invalid ||
      this.paymentForm.invalid ||
      this.billingForm.invalid
    ) {
      return;
    }

    this.renderer.addClass(this.orderReceipt.nativeElement, 'show-receipt');
  }

  getBasketProducts() {
    let totalPay: number = 0;
    const subscription = this.dataService
      .getAddedProducts()
      .subscribe((data) => {
        this.basketProducts = data;
        this.basketProducts.forEach((product) => {
          console.log(product);
          totalPay += product.count * product.product.price;
          console.log(this.totalPrice);
        });
        this.totalPrice = totalPay;
        this.vatAmount = 0.2 * this.totalPrice;
        this.grandTotalAmount =
          this.totalPrice + this.vatAmount + this.shippingAmount;
        this.showOtherText = `and ${this.basketProducts.length - 1} other item`;
      });

    this.subscriptions.push(subscription);
  }

  onShowOther() {
    this.isShowOther = !this.isShowOther;
    this.showOtherText = this.isShowOther
      ? 'View less'
      : `And ${this.basketProducts.length - 1} other item`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
