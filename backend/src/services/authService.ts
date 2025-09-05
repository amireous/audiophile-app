import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../models/database';
import { config } from '../config';
import { User, LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from '../models/types';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      const { username, password, email, first_name, last_name } = userData;

      // Check if user already exists
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
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
          
          db.run(
            'INSERT INTO users (username, password_hash, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, passwordHash, email, first_name, last_name, 'customer'],
            function(err) {
              if (err) {
                reject(err);
                return;
              }

              const userId = this.lastID;
              const payload: JwtPayload = { userId, username, role: 'customer' };
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
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      const { username, password } = loginData;

      db.get(
        'SELECT id, username, password_hash, email, first_name, last_name, role FROM users WHERE username = ?',
        [username],
        async (err, user: User) => {
          if (err) {
            reject(err);
            return;
          }

          if (!user) {
            reject(new Error('Invalid credentials'));
            return;
          }

          try {
            const isValidPassword = await this.comparePassword(password, user.password_hash!);
            
            if (!isValidPassword) {
              reject(new Error('Invalid credentials'));
              return;
            }

            const payload: JwtPayload = { 
              userId: user.id!, 
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
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  static async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    return new Promise((resolve, reject) => {
      try {
        const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtPayload;
        const accessToken = this.generateAccessToken(decoded);
        resolve({ access_token: accessToken });
      } catch (error) {
        reject(new Error('Invalid refresh token'));
      }
    });
  }

  static async createDefaultAdmin(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', ['admin'], async (err, row) => {
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
          
          db.run(
            'INSERT INTO users (username, password_hash, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            ['admin', passwordHash, 'admin@audiophile.com', 'Admin', 'User', 'admin'],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
