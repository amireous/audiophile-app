import { Request, Response } from 'express';
export declare class ProductController {
    static getAllProducts(req: Request, res: Response): Promise<void>;
    static getProductById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getProductBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static markAsViewed(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const createProductValidation: import("express-validator").ValidationChain[];
export declare const updateProductValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=productController.d.ts.map