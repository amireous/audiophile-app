import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/data.model';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  productDetail!: Product;
  productCount!: number;
  productCountControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(99),
    Validators.min(1),
  ]);

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((data) => {
      this.getProduct(data.id);
    });
  }

  getProduct(productId: string) {
    this.dataService.getHomeData().subscribe((data) => {
      this.productDetail = data.find((product: any) => product.id == productId);
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
    this.dataService.addProductToBasket({
      count: this.productCountControl.value,
      title: this.productDetail.name.split(' ')[0],
      product: this.productDetail,
    });
  }
}
