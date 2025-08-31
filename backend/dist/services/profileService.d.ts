import { User } from '../models/types';
export declare class ProfileService {
    static getProfile(userId: number): Promise<User | null>;
    static updateProfile(userId: number, profileData: Partial<User>): Promise<User | null>;
}
//# sourceMappingURL=profileService.d.ts.map