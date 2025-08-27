import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class OrderController {
    static addToCart(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getCart(req: AuthRequest, res: Response): Promise<void>;
    static removeFromCart(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static checkout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getUserOrders(req: AuthRequest, res: Response): Promise<void>;
    static getOrderById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllOrders(req: Request, res: Response): Promise<void>;
    static updateOrderStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const addToCartValidation: import("express-validator").ValidationChain[];
export declare const checkoutValidation: import("express-validator").ValidationChain[];
export declare const updateOrderStatusValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=orderController.d.ts.map