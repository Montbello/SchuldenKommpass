// src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole, UserStatus, UUID } from '../../../common/src/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory database for users
const users: User[] = [];

// Mock secret key for JWT. In a real app, this would be in a .env file.
const JWT_SECRET = 'your-super-secret-key'; 

export const authService = {
  async register(data: any): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
    const { email, password, name } = data;

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser: User = {
      user_id: uuidv4() as UUID,
      email,
      password_hash,
      name,
      role: UserRole.USER, // Default role
      status: UserStatus.ACTIVE, // Default status
      created_at: new Date(),
      updated_at: new Date(),
    };

    users.push(newUser);

    // Generate JWT
    const token = jwt.sign({ id: newUser.user_id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const { password_hash: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  },

  async login(data: any): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
    const { email, password } = data;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials.');
    }

    // Generate JWT
    const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });
    
    const { password_hash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },
};
