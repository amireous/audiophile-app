import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from 'src/app/models/data.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  homeData: Product[] = [];

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<Product[]> {
    return this.http.get<Product[]>('assets/data.json');
  }
}
