import { Category, Product } from '../models/types';
export declare class CategoryService {
    static getAllCategories(): Promise<Category[]>;
    static getCategoryById(id: number): Promise<Category | null>;
    static getCategoryWithProducts(id: number): Promise<{
        category: Category;
        products: Product[];
    } | null>;
    static createCategory(categoryData: Omit<Category, 'id' | 'created_at'>): Promise<Category>;
    static updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | null>;
    static deleteCategory(id: number): Promise<boolean>;
}
//# sourceMappingURL=categoryService.d.ts.map