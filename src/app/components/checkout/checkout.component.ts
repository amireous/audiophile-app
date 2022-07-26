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

  isCashOnDeliverySelected: boolean = true;

  basketProducts: any[] = [];
  subscriptions: Subscription[] = [];

  @ViewChild('emoneyNumber', { static: true }) emoneyNumber!: ElementRef;
  @ViewChild('emoneyPin', { static: true }) emoneyPin!: ElementRef;
  @ViewChild('pin') pin: any;

  constructor(private dataService: DataService, private renderer: Renderer2) {}

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
        Validators.maxLength(5),
      ]),
      city: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
    });

    this.paymentForm = new FormGroup({
      method: new FormControl(1),
      pin: new FormControl(''),
      number: new FormControl(''),
    });

    this.paymentForm.controls['method'].valueChanges.subscribe((val) => {
      if (val == 1) {
        this.isCashOnDeliverySelected = true;
        this.paymentForm.get('pin')?.reset();
        this.paymentForm.get('number')?.reset();
      } else {
        this.isCashOnDeliverySelected = false;
        // this.paymentForm.controls['pin'].clearValidators();
        // this.paymentForm.controls['number'].clearValidators();
        // this.paymentForm.controls['number'].clearValidators();
        // this.paymentForm.controls['number'].updateValueAndValidity({
        //   onlySelf: true,
        // });
        // this.paymentForm.controls['pin'].updateValueAndValidity({
        //   onlySelf: true,
        // });
        // this.cdr.detectChanges();
      }

      console.log(
        this.paymentForm.controls['pin'].errors,
        this.paymentForm.controls['number'].errors
      );
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
      });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
