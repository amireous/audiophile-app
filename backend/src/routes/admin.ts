import { Router } from 'express';
import { ProductController, createProductValidation, updateProductValidation } from '../controllers/productController';
import { CategoryController, createCategoryValidation, updateCategoryValidation } from '../controllers/categoryController';
import { OrderController, updateOrderStatusValidation } from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// Admin Product routes
router.get('/products', ProductController.getAllProducts);
router.get('/products/:id', ProductController.getProductById);
router.post('/products', createProductValidation, ProductController.createProduct);
router.put('/products/:id', updateProductValidation, ProductController.updateProduct);
router.delete('/products/:id', ProductController.deleteProduct);

// Admin Category routes
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.post('/categories', createCategoryValidation, CategoryController.createCategory);
router.put('/categories/:id', updateCategoryValidation, CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

// Admin Order routes
router.get('/orders', OrderController.getAllOrders);
router.get('/orders/:id', OrderController.getOrderById);
router.put('/orders/:id/status', updateOrderStatusValidation, OrderController.updateOrderStatus);

export default router;
