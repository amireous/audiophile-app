import db from '../models/database';
import { User } from '../models/types';

export class ProfileService {
  static async getProfile(userId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, first_name, last_name, profile_pic_url, phone, address, role, created_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as User || null);
          }
        }
      );
    });
  }

  static async updateProfile(userId: number, profileData: Partial<User>): Promise<User | null> {
    return new Promise((resolve, reject) => {
      // Build dynamic update query based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];

      if (profileData.first_name !== undefined) {
        updateFields.push('first_name = ?');
        values.push(profileData.first_name);
      }

      if (profileData.last_name !== undefined) {
        updateFields.push('last_name = ?');
        values.push(profileData.last_name);
      }

      if (profileData.phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(profileData.phone);
      }

      if (profileData.address !== undefined) {
        updateFields.push('address = ?');
        values.push(profileData.address);
      }

      if (profileData.profile_pic_url !== undefined) {
        updateFields.push('profile_pic_url = ?');
        values.push(profileData.profile_pic_url);
      }

      if (updateFields.length === 0) {
        // No fields to update, return current profile
        return this.getProfile(userId).then(resolve).catch(reject);
      }

      values.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      db.run(updateQuery, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null); // No rows updated
        } else {
          // Return updated profile
          ProfileService.getProfile(userId).then(resolve).catch(reject);
        }
      });
    });
  }
}
