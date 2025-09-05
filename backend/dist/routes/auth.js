"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public authentication routes
router.post('/register', authController_1.registerValidation, authController_1.AuthController.register);
router.post('/login', authController_1.loginValidation, authController_1.AuthController.login);
router.post('/refresh', authController_1.AuthController.refreshToken);
// Protected profile routes
router.get('/profile', auth_1.authenticateToken, profileController_1.ProfileController.getProfile);
router.put('/profile', auth_1.authenticateToken, profileController_1.updateProfileValidation, profileController_1.ProfileController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map