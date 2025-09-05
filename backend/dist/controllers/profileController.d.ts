import { Request, Response } from 'express';
export declare class ProfileController {
    static getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const updateProfileValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=profileController.d.ts.map