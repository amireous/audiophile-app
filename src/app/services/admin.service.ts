import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Product {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  price: number;
  currency?: string;
  is_new?: boolean;
  features?: string;
  box_details?: string;
  category_id?: number;
  created_at?: string;
  category?: Category;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Order {
  id?: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  payment_method?: string;
  created_at?: string;
  user?: any;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Product Management
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin/products`, { headers: this.getHeaders() });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Omit<Product, 'id' | 'created_at'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, product, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/products/${id}`, { headers: this.getHeaders() });
  }

  // Category Management
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/admin/categories`, { headers: this.getHeaders() });
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: Omit<Category, 'id' | 'created_at'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/admin/categories`, category, { headers: this.getHeaders() });
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/admin/categories/${id}`, category, { headers: this.getHeaders() });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/categories/${id}`, { headers: this.getHeaders() });
  }

  // Order Management
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/orders`, { headers: this.getHeaders() });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: number, status: Order['status']): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/admin/orders/${id}/status`, { status }, { headers: this.getHeaders() });
  }
}
