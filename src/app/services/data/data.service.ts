import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, find, map } from 'rxjs/operators';
import { Product } from 'src/app/models/data.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  homeData: Product[] = [];
  addedProducts: BehaviorSubject<any> = new BehaviorSubject([]);
  selectedProduct = new BehaviorSubject('');

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<any> {
    return this.http.get<any>('assets/data.json');
  }

  addProductToBasket(product: any) {
    this.addedProducts.next([...this.addedProducts.value, product]);
  }

  removeProductFromBasket(product: any) {
    this.addedProducts.pipe(filter((el: any) => el.id !== product.id));
  }

  getAddedProducts() {
    return this.addedProducts.asObservable();
  }

  removeAllAddedProducts() {
    this.addedProducts.next([])  
  }
}
