import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, find, map, take } from 'rxjs/operators';
import { Product } from 'src/app/models/data.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  homeData: Product[] = [];
  addedProducts: BehaviorSubject<any> = new BehaviorSubject([]);
  selectedProduct = new BehaviorSubject('');
  isDuplicated: boolean = false;

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<any> {
    return this.http.get<any>('assets/data.json');
  }

  addProductToBasket(product: any) {
    this.checkDuplicatedBasketProducts(product);
  }

  removeProductFromBasket(product: any) {
    let list: any = [];
    this.getAddedProducts()
      .pipe(take(1))
      .subscribe((data) => {
        list = data;
      });

    list = list.filter((el: any) => el.product.id !== product.product.id);

    this.addedProducts.next(list);
  }

  getAddedProducts() {
    return this.addedProducts.asObservable();
  }

  removeAllAddedProducts() {
    this.addedProducts.next([]);
  }

  checkDuplicatedBasketProducts(product: any) {
    let productsList: any[] = [];
    this.getAddedProducts()
      .pipe(take(1))
      .subscribe((data) => {
        productsList = data;
      });
    let duplicated = productsList.findIndex(
      (item) => item.product.id == product.product.id
    );

    if (duplicated !== -1) {
      productsList[duplicated].count += Number(product.count);
      this.addedProducts.next(productsList);
    } else {
      this.addedProducts.next([...this.addedProducts.value, product]);
    }
  }
}
