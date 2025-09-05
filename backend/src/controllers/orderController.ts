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

  static async clearCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      await OrderService.clearCart(userId);
      res.json({ message: 'Cart cleared successfully' });
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
      const { 
        shipping_address, 
        payment_method, 
        total_amount, 
        items, 
        billing_details 
      } = req.body;

      const order = await OrderService.createOrderFromPayload(
        userId, 
        shipping_address, 
        payment_method, 
        total_amount, 
        items, 
        billing_details
      );
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
  body('payment_method').notEmpty().withMessage('Payment method is required'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('billing_details').optional().isObject().withMessage('Billing details must be an object'),
  body('billing_details.name').optional().notEmpty().withMessage('Billing name is required if provided'),
  body('billing_details.email').optional().isEmail().withMessage('Valid billing email is required if provided'),
  body('billing_details.phone').optional().notEmpty().withMessage('Billing phone is required if provided')
];

export const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required')
];
