import { LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from '../models/types';
export declare class AuthService {
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateAccessToken(payload: JwtPayload): string;
    static generateRefreshToken(payload: JwtPayload): string;
    static register(userData: RegisterRequest): Promise<AuthResponse>;
    static login(loginData: LoginRequest): Promise<AuthResponse>;
    static refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    static createDefaultAdmin(): Promise<void>;
}
//# sourceMappingURL=authService.d.ts.map