import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    price: number;
    currency?: string;
    is_new?: boolean;
    category_id?: number;
  };
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface AddToCartResponse {
  message: string;
  cart_item: CartItem;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private apiUrl = environment.baseUrl;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get all cart items from backend
   */
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/basket`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        this.cartItemsSubject.next(response || []);
        return response || [];
      })
    );
  }

  /**
   * Add product to cart
   */
  addToCart(request: AddToCartRequest): Observable<AddToCartResponse> {
    return this.http.post<AddToCartResponse>(`${this.apiUrl}/basket/add`, request, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        // Refresh cart items after adding
        this.getCartItems().subscribe();
        return response;
      })
    );
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/basket/${productId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        // Refresh cart items after removing
        this.getCartItems().subscribe();
        return response;
      })
    );
  }

  /**
   * Update product quantity in cart
   */
  updateCartItemQuantity(productId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/basket/${productId}`, { quantity }, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        // Refresh cart items after updating
        this.getCartItems().subscribe();
        return response;
      })
    );
  }

  /**
   * Clear all cart items
   */
  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/basket`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        this.cartItemsSubject.next([]);
        return response;
      })
    );
  }

  /**
   * Get current cart items count
   */
  getCartItemsCount(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  /**
   * Get current cart total price
   */
  getCartTotalPrice(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + (item.product.price * item.quantity), 0))
    );
  }

  /**
   * Refresh cart data
   */
  refreshCart(): void {
    this.getCartItems().subscribe();
  }
}
