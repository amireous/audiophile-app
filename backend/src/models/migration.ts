import db from './database';

export const migrateProductsTable = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Add new columns to products table if they don't exist
    const migrations = [
      'ALTER TABLE products ADD COLUMN includes TEXT',
      'ALTER TABLE products ADD COLUMN gallery TEXT', 
      'ALTER TABLE products ADD COLUMN others TEXT'
    ];

    let completed = 0;
    const total = migrations.length;

    migrations.forEach((migration) => {
      db.run(migration, (err) => {
        // Ignore errors if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Migration error: ${err.message}`);
        }
        
        completed++;
        if (completed === total) {
          console.log('Database migration completed');
          resolve();
        }
      });
    });
  });
};

export const migrateUsersTable = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Add new columns to users table if they don't exist
    const migrations = [
      'ALTER TABLE users ADD COLUMN phone TEXT',
      'ALTER TABLE users ADD COLUMN address TEXT'
    ];

    let completed = 0;
    const total = migrations.length;

    migrations.forEach((migration) => {
      db.run(migration, (err) => {
        // Ignore errors if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Migration error: ${err.message}`);
        }
        
        completed++;
        if (completed === total) {
          console.log('Users table migration completed');
          resolve();
        }
      });
    });
  });
};
