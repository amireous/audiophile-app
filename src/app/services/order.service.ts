import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product?: {
    id: number;
    name: string;
    image_url: string;
    price: number;
  };
}

export interface CheckoutItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface BillingDetails {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CheckoutRequest {
  shipping_address: string;
  payment_method: string;
  total_amount: number;
  items: CheckoutItem[];
  billing_details?: BillingDetails;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Create a new order (checkout)
   */
  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/checkout`, request, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Get all orders for the current user
   */
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`, { 
      headers: this.getHeaders() 
    });
  }
}
