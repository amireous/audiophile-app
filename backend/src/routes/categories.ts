import { Router } from 'express';
import { CategoryController, createCategoryValidation, updateCategoryValidation } from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, createCategoryValidation, CategoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategoryValidation, CategoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, CategoryController.deleteCategory);

export default router;
