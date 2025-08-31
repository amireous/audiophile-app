import { Router } from 'express';
import { OrderController, addToCartValidation, checkoutValidation, updateOrderStatusValidation } from '../controllers/orderController';
import { authenticateToken, requireAdmin, requireCustomer } from '../middleware/auth';

const router = Router();

// Customer routes (authenticated)
router.post('/basket/add', authenticateToken, requireCustomer, addToCartValidation, OrderController.addToCart);
router.get('/basket', authenticateToken, requireCustomer, OrderController.getCart);
router.delete('/basket/:product_id', authenticateToken, requireCustomer, OrderController.removeFromCart);
router.post('/checkout', authenticateToken, requireCustomer, checkoutValidation, OrderController.checkout);
router.get('/orders', authenticateToken, requireCustomer, OrderController.getUserOrders);
router.get('/orders/:id', authenticateToken, requireCustomer, OrderController.getOrderById);

// Note: Admin routes are now handled in /api/admin/orders

export default router;
