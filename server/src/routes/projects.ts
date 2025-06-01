/**
 * Projects Management Routes
 * Handles project operations, GitHub integration, and Figma collaboration
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get user projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', (req: Request, res: Response) => {
  const mockProjects = [
    {
      id: '1',
      name: 'DevDesk Nexus Hub',
      description: 'All-in-one development platform',
      status: 'active',
      githubRepo: 'user/devdesk-nexus-hub',
      figmaFile: 'figma-file-id-123',
      members: ['user1@example.com', 'user2@example.com'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Mobile App Project',
      description: 'React Native mobile application',
      status: 'planning',
      githubRepo: 'user/mobile-app',
      figmaFile: 'figma-file-id-456',
      members: ['user1@example.com'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  res.json({
    success: true,
    data: { projects: mockProjects },
  });
});

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/', (req: Request, res: Response) => {
  const { name, description, githubRepo, figmaFile } = req.body;
  
  const mockProject = {
    id: Date.now().toString(),
    name,
    description,
    status: 'planning',
    githubRepo,
    figmaFile,
    members: ['user@example.com'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: { project: mockProject },
  });
});

/**
 * @swagger
 * /api/v1/projects/{id}/github:
 *   get:
 *     summary: Get GitHub integration data
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: GitHub integration data
 */
router.get('/:id/github', (req: Request, res: Response) => {
  const { id } = req.params;

  const mockGithubData = {
    projectId: id,
    repository: 'user/project-repo',
    branches: ['main', 'develop', 'feature/new-ui'],
    commits: [
      {
        sha: 'abc123',
        message: 'Add new feature',
        author: 'user@example.com',
        date: new Date().toISOString(),
      },
      {
        sha: 'def456',
        message: 'Fix bug in authentication',
        author: 'user2@example.com',
        date: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    pullRequests: [
      {
        id: 1,
        title: 'Feature: New dashboard',
        status: 'open',
        author: 'user@example.com',
        createdAt: new Date().toISOString(),
      },
    ],
    issues: [
      {
        id: 1,
        title: 'Bug: Login not working',
        status: 'open',
        assignee: 'user2@example.com',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  res.json({
    success: true,
    data: { github: mockGithubData },
  });
});

/**
 * @swagger
 * /api/v1/projects/{id}/figma:
 *   get:
 *     summary: Get Figma integration data
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Figma integration data
 */
router.get('/:id/figma', (req: Request, res: Response) => {
  const { id } = req.params;

  const mockFigmaData = {
    projectId: id,
    fileId: 'figma-file-id-123',
    fileName: 'DevDesk Nexus Hub Design',
    lastModified: new Date().toISOString(),
    thumbnailUrl: 'https://figma.com/thumbnail/abc123',
    collaborators: [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'user@example.com',
        avatarUrl: 'https://avatar.com/user1',
      },
    ],
    components: [
      {
        id: 'comp1',
        name: 'Button',
        description: 'Primary button component',
        thumbnailUrl: 'https://figma.com/component/comp1',
      },
      {
        id: 'comp2',
        name: 'Card',
        description: 'Content card component',
        thumbnailUrl: 'https://figma.com/component/comp2',
      },
    ],
  };

  res.json({
    success: true,
    data: { figma: mockFigmaData },
  });
});

/**
 * @swagger
 * /api/v1/projects/{id}/boards:
 *   get:
 *     summary: Get project boards
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project boards data
 */
router.get('/:id/boards', (req: Request, res: Response) => {
  const { id } = req.params;

  const mockBoards = [
    {
      id: 'board1',
      name: 'Development Tasks',
      type: 'kanban',
      columns: [
        {
          id: 'col1',
          name: 'To Do',
          tasks: [
            {
              id: 'task1',
              title: 'Implement authentication',
              description: 'Add JWT-based authentication',
              assignee: 'user@example.com',
              priority: 'high',
              dueDate: new Date(Date.now() + 86400000).toISOString(),
            },
          ],
        },
        {
          id: 'col2',
          name: 'In Progress',
          tasks: [
            {
              id: 'task2',
              title: 'Design dashboard UI',
              description: 'Create responsive dashboard layout',
              assignee: 'designer@example.com',
              priority: 'medium',
              dueDate: new Date(Date.now() + 172800000).toISOString(),
            },
          ],
        },
        {
          id: 'col3',
          name: 'Done',
          tasks: [],
        },
      ],
    },
  ];

  res.json({
    success: true,
    data: { boards: mockBoards },
  });
});

export default router; 