export interface User {
    id?: number;
    username: string;
    password_hash?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_pic_url?: string;
    phone?: string;
    address?: string;
    role: 'admin' | 'customer';
    created_at?: string;
}
export interface Category {
    id?: number;
    name: string;
    description?: string;
    created_at?: string;
}
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
export interface Order {
    id?: number;
    user_id: number;
    total_amount: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address?: string;
    payment_method?: string;
    created_at?: string;
    user?: User;
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
export interface CartItem {
    id?: number;
    user_id: number;
    product_id: number;
    quantity: number;
    created_at?: string;
    product?: Product;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    first_name?: string;
    last_name?: string;
}
export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password_hash'>;
}
export interface JwtPayload {
    userId: number;
    username: string;
    role: string;
}
//# sourceMappingURL=types.d.ts.map