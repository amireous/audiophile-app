import fs from 'fs';
import path from 'path';
import db from '../models/database';
import { migrateProductsTable } from '../models/migration';

interface JsonProduct {
  id: number;
  slug: string;
  name: string;
  image: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  category: string;
  new: boolean;
  price: number;
  description: string;
  features: string;
  includes: Array<{
    quantity: number;
    item: string;
  }>;
  gallery: {
    first: { mobile: string; tablet: string; desktop: string };
    second: { mobile: string; tablet: string; desktop: string };
    third: { mobile: string; tablet: string; desktop: string };
  };
  others: Array<{
    slug: string;
    name: string;
    image: { mobile: string; tablet: string; desktop: string };
  }>;
}

const importData = async () => {
  try {
    console.log('Starting data import...');

    // Run migration first
    await migrateProductsTable();

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../../src/assets/data.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const products: JsonProduct[] = JSON.parse(jsonData);

    console.log(`Found ${products.length} products to import`);

    // Get category mappings
    const categoryMap = new Map<string, number>();
    const categories = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, name FROM categories', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    console.log('Category mappings:', Object.fromEntries(categoryMap));

    // Import each product
    for (const product of products) {
      const categoryId = categoryMap.get(product.category.toLowerCase());
      
      if (!categoryId) {
        console.warn(`Category '${product.category}' not found for product '${product.name}'`);
        continue;
      }

      // Use desktop image as primary image_url
      const imageUrl = product.image.desktop;

      // Convert complex objects to JSON strings
      const includesJson = JSON.stringify(product.includes);
      const galleryJson = JSON.stringify(product.gallery);
      const othersJson = JSON.stringify(product.others);

      // Check if product already exists
      const existingProduct = await new Promise<any>((resolve, reject) => {
        db.get('SELECT id FROM products WHERE slug = ?', [product.slug], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingProduct) {
        // Update existing product
        await new Promise<void>((resolve, reject) => {
          db.run(`
            UPDATE products 
            SET name = ?, description = ?, image_url = ?, price = ?, 
                is_new = ?, features = ?, includes = ?, gallery = ?, others = ?, category_id = ?
            WHERE slug = ?
          `, [
            product.name,
            product.description,
            imageUrl,
            product.price,
            product.new ? 1 : 0,
            product.features,
            includesJson,
            galleryJson,
            othersJson,
            categoryId,
            product.slug
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Updated product: ${product.name}`);
      } else {
        // Insert new product
        await new Promise<void>((resolve, reject) => {
          db.run(`
            INSERT INTO products (name, slug, description, image_url, price, is_new, features, includes, gallery, others, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            product.name,
            product.slug,
            product.description,
            imageUrl,
            product.price,
            product.new ? 1 : 0,
            product.features,
            includesJson,
            galleryJson,
            othersJson,
            categoryId
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Imported product: ${product.name}`);
      }
    }

    console.log('Data import completed successfully!');

    // Verify import
    const importedProducts = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, name, slug, category_id FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`Total products in database: ${importedProducts.length}`);
    console.log('Imported products:', importedProducts.map(p => ({ id: p.id, name: p.name, slug: p.slug })));

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Run the import if this script is executed directly
if (require.main === module) {
  importData().then(() => {
    console.log('Import script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Import script failed:', error);
    process.exit(1);
  });
}

export default importData;
