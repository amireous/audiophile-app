import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  billingForm = new FormGroup({});
  shippingForm = new FormGroup({});
  paymentForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {
    this.initForm();
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
}
