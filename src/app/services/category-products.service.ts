import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/models/data.model';

export interface CategoryProductsResponse {
  [categoryName: string]: Product[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryProductsService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get products by category name (up to 4 products) - Using category ID
   * @param categoryName The name of the category (e.g., 'headphones', 'speakers', 'earphones')
   * @returns Observable of products array
   */
  getProductsByCategory(categoryName: string): Observable<Product[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      switchMap(categories => {
        const category = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (!category) {
  
          return [];
        }

        // Call the category details API with ID
        return this.http.get<any>(`${this.apiUrl}/categories/${category.id}`).pipe(
          map(response => {
            if (response && response.products) {
              // Limit to 4 products and transform
              const limitedProducts = response.products.slice(0, 4);
      
              return this.transformProducts(limitedProducts);
            }
    
            return [];
          })
        );
      })
    );
  }

  /**
   * Get products for multiple categories
   * @param categoryNames Array of category names
   * @returns Observable of products grouped by category
   */
  getProductsByCategories(categoryNames: string[]): Observable<CategoryProductsResponse> {
    const requests = categoryNames.map(categoryName => 
      this.getProductsByCategory(categoryName).pipe(
        map(products => ({ [categoryName]: products }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        const combined: CategoryProductsResponse = {};
        results.forEach(result => {
          Object.assign(combined, result);
        });
        return combined;
      })
    );
  }

  /**
   * Get all products and group them by category
   * @returns Observable of products grouped by category
   */
  getAllProductsByCategory(): Observable<CategoryProductsResponse> {
    return this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
      map(products => {
        const grouped: CategoryProductsResponse = {};
        
        products.forEach(product => {
          const categoryName = product.category?.name || 'uncategorized';
          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }
          grouped[categoryName].push(this.transformProduct(product));
        });

        return grouped;
      })
    );
  }

  /**
   * Get featured products for home page (first few products from each category)
   * @param limit Number of products per category (default: 3)
   * @returns Observable of featured products grouped by category
   */
  getFeaturedProducts(limit: number = 3): Observable<CategoryProductsResponse> {
    return this.getAllProductsByCategory().pipe(
      map(groupedProducts => {
        const featured: CategoryProductsResponse = {};
        
        Object.keys(groupedProducts).forEach(categoryName => {
          featured[categoryName] = groupedProducts[categoryName].slice(0, limit);
        });

        return featured;
      })
    );
  }

  /**
   * Transform backend product format to frontend format
   * Matches the existing Product interface structure
   */
  private transformProduct(backendProduct: any): Product {
    // Create image object with different sizes using the existing image_url
    const imageUrl = backendProduct.image_url || './assets/shared/placeholder.jpg';
    const image = {
      mobile: imageUrl,
      tablet: imageUrl,
      desktop: imageUrl
    };

    // Create gallery images (using the same image for all gallery positions)
    const gallery = {
      first: image,
      second: image,
      third: image
    };

    // Create includes array (empty for now, can be populated from backend if available)
    const includes: Array<{ quantity: number; item: string }> = [];

    // Create others array (empty for now, can be populated from backend if available)
    const others: Array<{ slug: string; name: string; image: any }> = [];

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

  /**
   * Transform array of backend products
   */
  private transformProducts(backendProducts: any[]): Product[] {
    return backendProducts.map(product => this.transformProduct(product));
  }

  /**
   * Get specific category products for home page (up to 4 products)
   * @param categoryName Category name
   * @returns Observable of products array
   */
  getHomeCategoryProducts(categoryName: string): Observable<Product[]> {
    return this.getProductsByCategory(categoryName);
  }

  /**
   * Get all categories with products (for home page)
   * @returns Observable of categories array with products
   */
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      map(categories => {
        // Transform products in each category
        return categories.map(category => ({
          ...category,
          products: category.products ? this.transformProducts(category.products) : []
        }));
      })
    );
  }
}
