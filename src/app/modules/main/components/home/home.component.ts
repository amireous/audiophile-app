import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/data.model';

import { CategoryProductsService } from 'src/app/services/category-products.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private categoryProductsService: CategoryProductsService,
    private router: Router,
  ) {}
  productList: Product[] = [];
  title: any;

  currentPath!: string;
  innerWidth!: number;

  earphonesData: Product[] = [];
  speakersData: Product[] = [];
  headphonesData: Product[] = [];
  categories: any[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.currentPath = this.router.url.split('/')[1].length > 0 ? this.router.url.split('/')[1] : 'home';
    this.loadHomeData();
  }

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  loadHomeData() {
    this.isLoading = true;

    
    if (this.currentPath === 'home') {
      // For home page: get all categories with products
      this.categoryProductsService.getCategories().subscribe({
        next: (categories) => {
  
          
          // Extract products for each category
          categories.forEach(category => {
            if (category.name.toLowerCase() === 'speakers' && category.products) {
              this.speakersData = category.products;
            } else if (category.name.toLowerCase() === 'earphones' && category.products) {
              this.earphonesData = category.products;
            } else if (category.name.toLowerCase() === 'headphones' && category.products) {
              this.headphonesData = category.products;
            }
          });
          
          this.categories = categories;
          this.isLoading = false;
        },
        error: (error) => {
  
          this.isLoading = false;
          this.loadFallbackData();
        }
      });
    } else {
      // For category pages: get products for specific category using category ID
      this.categoryProductsService.getProductsByCategory(this.currentPath).subscribe({
        next: (products) => {
  
          
          // Set products based on category
          if (this.currentPath === 'speakers') {
            this.speakersData = products;
          } else if (this.currentPath === 'earphones') {
            this.earphonesData = products;
          } else if (this.currentPath === 'headphones') {
            this.headphonesData = products;
          }
          
          // Set product list for category pages
          this.productList = products;
          
          this.isLoading = false;
        },
        error: (error) => {
  
          this.isLoading = false;
          this.loadFallbackData();
        }
      });
    }
  }

  loadFallbackData() {
    // Fallback to local JSON data if API is not available
    // For now, we'll just log an error since we're removing DataService
    
    this.isLoading = false;
  }

  getCurrentPathData(path: string = '') {

    if (path === 'speakers') path = 'speaker';
    
    // Filter products by category for fallback
    this.speakersData = this.productList.filter((product: any) =>
      product?.category?.includes('speakers')
    );
    this.earphonesData = this.productList.filter((product: any) =>
      product?.category?.includes('earphones')
    );
    this.headphonesData = this.productList.filter((product: any) =>
      product?.category?.includes('headphones')
    );
    
    this.productList = this.productList.filter((product: any) =>
      product?.slug?.includes(path)
    );
  }

  onSeeProduct(product: Product) {
    this.router.navigate(['/', 'product-detail', product?.id]);
  }
}
