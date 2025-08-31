"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = exports.ProfileController = void 0;
const express_validator_1 = require("express-validator");
const profileService_1 = require("../services/profileService");
class ProfileController {
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const profile = await profileService_1.ProfileService.getProfile(userId);
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            res.json(profile);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async updateProfile(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = req.user.userId;
            const profileData = req.body;
            const updatedProfile = await profileService_1.ProfileService.updateProfile(userId, profileData);
            if (!updatedProfile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            res.json(updatedProfile);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
}
exports.ProfileController = ProfileController;
// Validation middleware
exports.updateProfileValidation = [
    (0, express_validator_1.body)('first_name').optional().isString().isLength({ max: 50 }),
    (0, express_validator_1.body)('last_name').optional().isString().isLength({ max: 50 }),
    (0, express_validator_1.body)('phone').optional().isString().isLength({ max: 20 }),
    (0, express_validator_1.body)('address').optional().isString().isLength({ max: 200 }),
    (0, express_validator_1.body)('profile_pic_url').optional().isString().custom((value) => {
        if (!value)
            return true; // Allow empty/null values
        // Allow regular URLs or base64 data URLs
        if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
            return true;
        }
        throw new Error('profile_pic_url must be a valid URL or base64 data URL');
    })
];
//# sourceMappingURL=profileController.js.map