"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const database_1 = __importDefault(require("../models/database"));
class ProfileService {
    static async getProfile(userId) {
        return new Promise((resolve, reject) => {
            database_1.default.get('SELECT id, username, email, first_name, last_name, profile_pic_url, phone, address, role, created_at FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row || null);
                }
            });
        });
    }
    static async updateProfile(userId, profileData) {
        return new Promise((resolve, reject) => {
            // Build dynamic update query based on provided fields
            const updateFields = [];
            const values = [];
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
            database_1.default.run(updateQuery, values, function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes === 0) {
                    resolve(null); // No rows updated
                }
                else {
                    // Return updated profile
                    ProfileService.getProfile(userId).then(resolve).catch(reject);
                }
            });
        });
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profileService.js.map