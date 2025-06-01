/**
 * Documents & File Management Routes
 * Handles file upload, download, sharing, and document operations
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Get user documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', (req: Request, res: Response) => {
  const mockDocuments = [
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: 2048576,
      url: '/api/v1/documents/1/download',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Design Mockups.figma',
      type: 'figma',
      size: 1024000,
      url: '/api/v1/documents/2/download',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  res.json({
    success: true,
    data: { documents: mockDocuments },
  });
});

/**
 * @swagger
 * /api/v1/documents/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/upload', (req: Request, res: Response) => {
  const mockDocument = {
    id: Date.now().toString(),
    name: 'uploaded-file.pdf',
    type: 'pdf',
    size: 1024000,
    url: `/api/v1/documents/${Date.now()}/download`,
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: { document: mockDocument },
  });
});

/**
 * @swagger
 * /api/v1/documents/{id}/download:
 *   get:
 *     summary: Download a file
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 */
router.get('/:id/download', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Mock file download
  res.json({
    success: true,
    message: 'File download initiated',
    data: {
      downloadUrl: `https://storage.example.com/files/${id}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    },
  });
});

/**
 * @swagger
 * /api/v1/documents/{id}/share:
 *   post:
 *     summary: Share a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document shared successfully
 */
router.post('/:id/share', (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, permissions } = req.body;

  res.json({
    success: true,
    message: 'Document shared successfully',
    data: {
      shareId: Date.now().toString(),
      documentId: id,
      sharedWith: email,
      permissions: permissions || 'read',
      shareUrl: `https://app.example.com/shared/${Date.now()}`,
    },
  });
});

export default router; 