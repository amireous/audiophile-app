import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ProductService } from '../services/productService';

export class ProductController {
  // Public endpoints
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const product = await ProductService.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Admin endpoints
  static async createProduct(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const productData = req.body;
      const product = await ProductService.createProduct(productData);
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const productData = req.body;
      const product = await ProductService.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const deleted = await ProductService.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async markAsViewed(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      const userId = (req as any).user.userId;

      if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const success = await ProductService.markAsViewed(productId, userId);
      if (!success) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ success: true, message: 'Product marked as viewed' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// Validation middleware
export const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('slug').notEmpty().withMessage('Product slug is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('currency').optional().isString(),
  body('is_new').optional().isBoolean(),
  body('category_id').optional().isInt({ min: 1 }),
  body('description').optional().isString(),
  body('features').optional().isString(),
  body('box_details').optional().isString()
];

export const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('slug').optional().notEmpty().withMessage('Product slug cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('currency').optional().isString(),
  body('is_new').optional().isBoolean(),
  body('category_id').optional().isInt({ min: 1 }),
  body('description').optional().isString(),
  body('features').optional().isString(),
  body('box_details').optional().isString()
];
