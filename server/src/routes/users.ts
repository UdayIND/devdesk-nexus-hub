/**
 * Users Management Routes
 * Handles user profile operations and user management
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', (req: Request, res: Response) => {
  const mockUsers = [
    {
      id: '1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  res.json({
    success: true,
    data: { users: mockUsers },
  });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  const mockUser = {
    id,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: { user: mockUser },
  });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
      },
    },
  });
});

export default router; 