import { Request, Response } from 'express';
export declare class CategoryController {
    static getAllCategories(req: Request, res: Response): Promise<void>;
    static getCategoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const createCategoryValidation: import("express-validator").ValidationChain[];
export declare const updateCategoryValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=categoryController.d.ts.map