import { Router } from 'express';
import { AuthController, registerValidation, loginValidation } from '../controllers/authController';

const router = Router();

// Public authentication routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh', AuthController.refreshToken);

export default router;
