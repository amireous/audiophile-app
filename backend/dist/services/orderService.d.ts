import { Order, CartItem } from '../models/types';
export declare class OrderService {
    static addToCart(userId: number, productId: number, quantity?: number): Promise<CartItem>;
    static getCart(userId: number): Promise<CartItem[]>;
    static removeFromCart(userId: number, productId: number): Promise<boolean>;
    static clearCart(userId: number): Promise<void>;
    static createOrderFromPayload(userId: number, shippingAddress: string, paymentMethod: string, totalAmount: number, items: Array<{
        product_id: number;
        quantity: number;
        price: number;
    }>, billingDetails?: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<Order>;
    static createOrder(userId: number, shippingAddress: string, paymentMethod: string): Promise<Order>;
    static getUserOrders(userId: number): Promise<Order[]>;
    static getAllOrders(): Promise<Order[]>;
    static getOrderById(orderId: number): Promise<Order | null>;
    static updateOrderStatus(orderId: number, status: Order['status']): Promise<Order | null>;
}
//# sourceMappingURL=orderService.d.ts.map