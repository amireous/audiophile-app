import { Product } from '../models/types';
export declare class ProductService {
    static getAllProducts(): Promise<Product[]>;
    static getProductById(id: number): Promise<Product | null>;
    static getProductBySlug(slug: string): Promise<Product | null>;
    static createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product>;
    static updateProduct(id: number, productData: Partial<Product>): Promise<Product | null>;
    static deleteProduct(id: number): Promise<boolean>;
    static getProductsByCategory(categoryId: number): Promise<Product[]>;
}
//# sourceMappingURL=productService.d.ts.map