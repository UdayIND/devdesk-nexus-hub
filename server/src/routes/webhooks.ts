/**
 * Webhooks Routes
 * Handles incoming webhooks from external services (GitHub, Figma, Render, etc.)
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// Webhook signature verification middleware
const verifyWebhookSignature = (secret: string) => {
  return (req: Request, res: Response, next: any): void => {
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) {
      res.status(401).json({ error: 'Missing signature' });
      return;
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    next();
  };
};

/**
 * @swagger
 * /api/v1/webhooks/github:
 *   post:
 *     summary: GitHub webhook handler
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/github', (req: Request, res: Response) => {
  const event = req.headers['x-github-event'] as string;
  const payload = req.body;

  console.log(`GitHub webhook received: ${event}`, payload);

  // Handle different GitHub events
  switch (event) {
    case 'push':
      // Handle push events
      console.log(`Push event: ${payload.commits?.length} commits to ${payload.ref}`);
      break;
    
    case 'pull_request':
      // Handle pull request events
      console.log(`Pull request ${payload.action}: ${payload.pull_request?.title}`);
      break;
    
    case 'issues':
      // Handle issue events
      console.log(`Issue ${payload.action}: ${payload.issue?.title}`);
      break;
    
    default:
      console.log(`Unhandled GitHub event: ${event}`);
  }

  res.json({
    success: true,
    message: 'GitHub webhook processed',
    event,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/v1/webhooks/figma:
 *   post:
 *     summary: Figma webhook handler
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/figma', (req: Request, res: Response) => {
  const payload = req.body;

  console.log('Figma webhook received:', payload);

  // Handle Figma events
  if (payload.event_type === 'FILE_UPDATE') {
    console.log(`Figma file updated: ${payload.file_name}`);
    // Notify team members about design updates
  } else if (payload.event_type === 'FILE_COMMENT') {
    console.log(`New comment on Figma file: ${payload.comment}`);
    // Handle new comments
  }

  res.json({
    success: true,
    message: 'Figma webhook processed',
    event: payload.event_type,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/v1/webhooks/render:
 *   post:
 *     summary: Render deployment webhook handler
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/render', (req: Request, res: Response) => {
  const payload = req.body;

  console.log('Render webhook received:', payload);

  // Handle Render deployment events
  if (payload.type === 'deploy') {
    const { status, service, deploy } = payload;
    console.log(`Deployment ${status} for service ${service.name}: ${deploy.id}`);
    
    // Notify team about deployment status
    if (status === 'success') {
      console.log(`✅ Deployment successful: ${deploy.finishedAt}`);
    } else if (status === 'failed') {
      console.log(`❌ Deployment failed: ${deploy.reason}`);
    }
  }

  res.json({
    success: true,
    message: 'Render webhook processed',
    type: payload.type,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/v1/webhooks/uptime:
 *   post:
 *     summary: Uptime monitoring webhook handler
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/uptime', (req: Request, res: Response) => {
  const payload = req.body;

  console.log('Uptime webhook received:', payload);

  // Handle uptime monitoring alerts
  if (payload.alertType === 'down') {
    console.log(`🚨 Service DOWN: ${payload.monitorFriendlyName}`);
    // Send alerts to team
  } else if (payload.alertType === 'up') {
    console.log(`✅ Service UP: ${payload.monitorFriendlyName}`);
    // Send recovery notification
  }

  res.json({
    success: true,
    message: 'Uptime webhook processed',
    alertType: payload.alertType,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/v1/webhooks/generic:
 *   post:
 *     summary: Generic webhook handler
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/generic', (req: Request, res: Response) => {
  const payload = req.body;
  const source = req.headers['x-webhook-source'] as string;

  console.log(`Generic webhook from ${source}:`, payload);

  res.json({
    success: true,
    message: 'Generic webhook processed',
    source,
    timestamp: new Date().toISOString(),
  });
});

export default router; 