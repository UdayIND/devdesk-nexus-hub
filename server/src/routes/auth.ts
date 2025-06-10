/**
 * Authentication Routes
 * Handles user registration, login, logout, and session management
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Mock users database (in production, use a real database)
const mockUsers = new Map();

// Helper function to create JWT token
const createToken = (userId: string, email: string, role: string) => {
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
  return jwt.sign(
    { id: userId, email, role },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

// Helper function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, rounds);
};

// Helper function to create user response
const createUserResponse = (user: any) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Helper function to send success response
const sendSuccess = (res: Response, message: string, data?: any, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Helper function to send error response
const sendError = (res: Response, message: string, statusCode = 400, code?: string) => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  });
};

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, company, phone } = validatedData;

    // Check if user already exists
    if (mockUsers.has(email)) {
      return sendError(res, 'User already exists with this email address', 409, 'USER_EXISTS');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      company,
      phone,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'user',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Store user
    mockUsers.set(email, newUser);

    // Create token
    const token = createToken(userId, email, 'user');
    const refreshToken = createToken(userId, email, 'user'); // In production, use different secret

    // Send response
    sendSuccess(res, 'User registered successfully', {
      user: createUserResponse(newUser),
      token,
      refreshToken,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Registration failed', 500, 'INTERNAL_ERROR');
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = mockUsers.get(email);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    mockUsers.set(email, user);

    // Create tokens
    const token = createToken(user.id, email, user.role);
    const refreshToken = createToken(user.id, email, user.role); // In production, use different secret

    // Send response
    sendSuccess(res, 'Login successful', {
      user: createUserResponse(user),
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Login failed', 500, 'INTERNAL_ERROR');
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    // In a real application, you would invalidate the token in your database
    // For now, we'll just return success since the client will clear the token
    sendSuccess(res, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Logout failed', 500, 'INTERNAL_ERROR');
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400, 'MISSING_TOKEN');
    }

    // Verify refresh token
    const jwtSecret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const decoded = jwt.verify(refreshToken, jwtSecret) as any;
    
    // Create new access token
    const newToken = createToken(decoded.id, decoded.email, decoded.role);
    
    sendSuccess(res, 'Token refreshed successfully', {
      token: newToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    sendError(res, 'Invalid refresh token', 401, 'INVALID_TOKEN');
  }
});

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token required', 401, 'MISSING_TOKEN');
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    const user = mockUsers.get(decoded.email);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    sendSuccess(res, 'Profile retrieved successfully', {
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    sendError(res, 'Failed to fetch profile', 401, 'INVALID_TOKEN');
  }
});

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               company:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Not authenticated
 */
router.put('/profile', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token required', 401, 'MISSING_TOKEN');
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    const user = mockUsers.get(decoded.email);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    // Update user with provided fields
    const allowedUpdates = ['name', 'company', 'phone'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {} as any);

    Object.assign(user, updates);
    mockUsers.set(decoded.email, user);

    sendSuccess(res, 'Profile updated successfully', {
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    sendError(res, 'Failed to update profile', 401, 'INVALID_TOKEN');
  }
});

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Not authenticated
 */
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token required', 401, 'MISSING_TOKEN');
    }

    const validatedData = changePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    const user = mockUsers.get(decoded.email);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return sendError(res, 'Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    mockUsers.set(decoded.email, user);

    sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    console.error('Password change error:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Failed to change password', 500, 'INTERNAL_ERROR');
  }
});

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', (req: Request, res: Response) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    const user = mockUsers.get(email);
    if (!user) {
      // For security, don't reveal whether user exists
      return sendSuccess(res, 'If an account with that email exists, a password reset link has been sent');
    }

    // In production, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send an email with the reset link
    
    sendSuccess(res, 'If an account with that email exists, a password reset link has been sent');
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Failed to process password reset request', 500, 'INTERNAL_ERROR');
  }
});

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    // In production, you would validate the reset token from the database
    // For demo purposes, we'll accept any token
    if (!token || token.length < 10) {
      return sendError(res, 'Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // In production, find user by reset token and update password
    // For demo, we'll just return success
    
    sendSuccess(res, 'Password reset successfully');
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Failed to reset password', 500, 'INTERNAL_ERROR');
  }
});

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/verify-email', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 'Verification token is required', 400, 'MISSING_TOKEN');
    }

    // In production, you would validate the verification token from the database
    // For demo purposes, we'll accept any token
    if (token.length < 10) {
      return sendError(res, 'Invalid or expired verification token', 400, 'INVALID_TOKEN');
    }

    sendSuccess(res, 'Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    sendError(res, 'Failed to verify email', 500, 'INTERNAL_ERROR');
  }
});

export default router; 