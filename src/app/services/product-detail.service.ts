import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from '../models/data.model';

export interface ProductDetailResponse {
  id: number;
  slug: string;
  name: string;
  image: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  category: string;
  new: boolean;
  price: number;
  description: string;
  features: string;
  includes: Array<{
    quantity: number;
    item: string;
  }>;
  gallery: {
    first: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    second: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    third: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  };
  others: Array<{
    slug: string;
    name: string;
    image: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }>;
}



@Injectable({
  providedIn: 'root'
})
export class ProductDetailService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }



  /**
   * Get product details by ID
   * @param id Product ID
   * @returns Observable of product detail
   */
  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`).pipe(
      map(backendProduct => this.transformBackendProductToDetailResponse(backendProduct))
    );
  }

  /**
   * Get product details by slug (recommended for routing)
   * @param slug Product slug
   * @returns Observable of product detail
   */
  getProductBySlug(slug: string): Observable<ProductDetailResponse> {
    return this.http.get<any>(`${this.apiUrl}/products/slug/${slug}`).pipe(
      map(backendProduct => this.transformBackendProductToDetailResponse(backendProduct))
    );
  }

  /**
   * Get related products for a specific product
   * @param productId Product ID
   * @returns Observable of related products array
   */
  getRelatedProducts(productId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/${productId}/related`);
  }

  /**
   * Get products by category
   * @param category Category name
   * @returns Observable of products array
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/categories/${category}/products`);
  }



  /**
   * Get product reviews
   * @param productId Product ID
   * @returns Observable of reviews array
   */
  getProductReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/${productId}/reviews`);
  }

  /**
   * Add product review (authenticated users only)
   * @param productId Product ID
   * @param review Review data
   * @returns Observable of review response
   */
  addProductReview(productId: number, review: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products/${productId}/reviews`, review, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Get product availability status
   * @param productId Product ID
   * @returns Observable of availability status
   */
  getProductAvailability(productId: number): Observable<{ in_stock: boolean; stock_quantity: number }> {
    return this.http.get<{ in_stock: boolean; stock_quantity: number }>(`${this.apiUrl}/products/${productId}/availability`);
  }

  /**
   * Search products by name or description
   * @param query Search query
   * @returns Observable of products array
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get product recommendations based on user preferences
   * @returns Observable of recommended products array
   */
  getProductRecommendations(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/recommendations`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Get product statistics (views, likes, etc.)
   * @param productId Product ID
   * @returns Observable of product statistics
   */
  getProductStats(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${productId}/stats`);
  }

  /**
   * Toggle product like/favorite (authenticated users only)
   * @param productId Product ID
   * @returns Observable of toggle response
   */
  toggleProductLike(productId: number): Observable<{ liked: boolean; message: string }> {
    return this.http.post<{ liked: boolean; message: string }>(`${this.apiUrl}/products/${productId}/like`, {}, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Get user's liked/favorite products
   * @returns Observable of liked products array
   */
  getLikedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/liked`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Get recently viewed products
   * @returns Observable of recently viewed products array
   */
  getRecentlyViewedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/recently-viewed`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Mark product as recently viewed
   * @param productId Product ID
   * @returns Observable of success response
   */
  markAsRecentlyViewed(productId: number): Observable<{ success: boolean }> {
    return this.http.get<any>(`${this.apiUrl}/products/${productId}/view`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Transform backend product format to frontend ProductDetailResponse format
   * @param backendProduct Backend product data
   * @returns Transformed ProductDetailResponse
   */
  private transformBackendProductToDetailResponse(backendProduct: any): ProductDetailResponse {
    // Create image object with different sizes using the existing image_url
    const imageUrl = backendProduct.image_url || './assets/shared/placeholder.jpg';
    const image = {
      mobile: imageUrl,
      tablet: imageUrl,
      desktop: imageUrl
    };

    // Parse includes from JSON string
    let includes: Array<{ quantity: number; item: string }> = [];
    if (backendProduct.includes) {
      try {
        includes = JSON.parse(backendProduct.includes);
      } catch (error) {

      }
    }

    // Parse gallery from JSON string
    let gallery = {
      first: image,
      second: image,
      third: image
    };
    if (backendProduct.gallery) {
      try {
        const galleryData = JSON.parse(backendProduct.gallery);
        gallery = {
          first: galleryData.first || image,
          second: galleryData.second || image,
          third: galleryData.third || image
        };
      } catch (error) {

      }
    }

    // Parse others from JSON string
    let others: Array<{ slug: string; name: string; image: any }> = [];
    if (backendProduct.others) {
      try {
        others = JSON.parse(backendProduct.others);
      } catch (error) {

      }
    }

    return {
      id: backendProduct.id,
      slug: backendProduct.slug,
      name: backendProduct.name,
      image: image,
      category: backendProduct.category?.name || backendProduct.category_name || 'uncategorized',
      new: backendProduct.is_new || false,
      price: backendProduct.price,
      description: backendProduct.description || '',
      features: backendProduct.features || '',
      includes: includes,
      gallery: gallery,
      others: others
    };
  }
}
