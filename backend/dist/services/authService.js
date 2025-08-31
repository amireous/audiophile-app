"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../models/database"));
const config_1 = require("../config");
class AuthService {
    static async hashPassword(password) {
        const saltRounds = 10;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: '15m' });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwtRefreshSecret, { expiresIn: '7d' });
    }
    static async register(userData) {
        return new Promise((resolve, reject) => {
            const { username, password, email, first_name, last_name } = userData;
            // Check if user already exists
            database_1.default.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    reject(new Error('Username or email already exists'));
                    return;
                }
                try {
                    const passwordHash = await this.hashPassword(password);
                    database_1.default.run('INSERT INTO users (username, password_hash, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)', [username, passwordHash, email, first_name, last_name, 'customer'], function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const userId = this.lastID;
                        const payload = { userId, username, role: 'customer' };
                        const accessToken = AuthService.generateAccessToken(payload);
                        const refreshToken = AuthService.generateRefreshToken(payload);
                        resolve({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                            user: {
                                id: userId,
                                username,
                                email,
                                first_name,
                                last_name,
                                role: 'customer'
                            }
                        });
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    static async login(loginData) {
        return new Promise((resolve, reject) => {
            const { username, password } = loginData;
            database_1.default.get('SELECT id, username, password_hash, email, first_name, last_name, role FROM users WHERE username = ?', [username], async (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!user) {
                    reject(new Error('Invalid credentials'));
                    return;
                }
                try {
                    const isValidPassword = await this.comparePassword(password, user.password_hash);
                    if (!isValidPassword) {
                        reject(new Error('Invalid credentials'));
                        return;
                    }
                    const payload = {
                        userId: user.id,
                        username: user.username,
                        role: user.role
                    };
                    const accessToken = this.generateAccessToken(payload);
                    const refreshToken = this.generateRefreshToken(payload);
                    resolve({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            role: user.role
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    static async refreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwtRefreshSecret);
                const accessToken = this.generateAccessToken(decoded);
                resolve({ access_token: accessToken });
            }
            catch (error) {
                reject(new Error('Invalid refresh token'));
            }
        });
    }
    static async createDefaultAdmin() {
        return new Promise((resolve, reject) => {
            database_1.default.get('SELECT id FROM users WHERE username = ?', ['admin'], async (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    resolve(); // Admin already exists
                    return;
                }
                try {
                    const passwordHash = await this.hashPassword('admin1234');
                    database_1.default.run('INSERT INTO users (username, password_hash, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)', ['admin', passwordHash, 'admin@audiophile.com', 'Admin', 'User', 'admin'], (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map