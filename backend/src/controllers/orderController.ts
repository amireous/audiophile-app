import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { OrderService } from '../services/orderService';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  // Cart endpoints (authenticated customers)
  static async addToCart(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const { product_id, quantity = 1 } = req.body;

      const cartItem = await OrderService.addToCart(userId, product_id, quantity);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const cart = await OrderService.getCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async removeFromCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { product_id } = req.params;

      const removed = await OrderService.removeFromCart(userId, parseInt(product_id));
      if (!removed) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Order endpoints (authenticated customers)
  static async checkout(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const { shipping_address, payment_method } = req.body;

      const order = await OrderService.createOrder(userId, shipping_address, payment_method);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getUserOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const orders = await OrderService.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response) {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user can access this order
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      
      if (userRole !== 'admin' && order.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Admin endpoints
  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await OrderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
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
export const addToCartValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

export const checkoutValidation = [
  body('shipping_address').notEmpty().withMessage('Shipping address is required'),
  body('payment_method').notEmpty().withMessage('Payment method is required')
];

export const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required')
];
