import { Router } from 'express';
import { AuthController, registerValidation, loginValidation } from '../controllers/authController';
import { ProfileController, updateProfileValidation } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public authentication routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Protected profile routes
router.get('/profile', authenticateToken, ProfileController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, ProfileController.updateProfile);

export default router;
