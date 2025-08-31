import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ProfileService } from '../services/profileService';

export class ProfileController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const profile = await ProfileService.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.userId;
      const profileData = req.body;
      
      const updatedProfile = await ProfileService.updateProfile(userId, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}

// Validation middleware
export const updateProfileValidation = [
  body('first_name').optional().isString().isLength({ max: 50 }),
  body('last_name').optional().isString().isLength({ max: 50 }),
  body('phone').optional().isString().isLength({ max: 20 }),
  body('address').optional().isString().isLength({ max: 200 }),
  body('profile_pic_url').optional().isString().custom((value) => {
    if (!value) return true; // Allow empty/null values
    // Allow regular URLs or base64 data URLs
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
      return true;
    }
    throw new Error('profile_pic_url must be a valid URL or base64 data URL');
  })
];
