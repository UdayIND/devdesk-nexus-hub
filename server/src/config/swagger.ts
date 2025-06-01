/**
 * Swagger/OpenAPI Documentation Configuration
 * Sets up API documentation with swagger-jsdoc and swagger-ui-express
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevDesk Nexus Hub API',
      version: '1.0.0',
      description: 'Comprehensive API for the DevDesk Nexus Hub development platform',
      contact: {
        name: 'DevDesk Team',
        email: 'support@devdesk.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.devdesk.com'
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Document ID',
            },
            name: {
              type: 'string',
              description: 'Document name',
            },
            type: {
              type: 'string',
              description: 'Document type/extension',
            },
            size: {
              type: 'number',
              description: 'File size in bytes',
            },
            url: {
              type: 'string',
              description: 'Download URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Project ID',
            },
            name: {
              type: 'string',
              description: 'Project name',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            status: {
              type: 'string',
              enum: ['planning', 'active', 'completed', 'archived'],
            },
            githubRepo: {
              type: 'string',
              description: 'GitHub repository name',
            },
            figmaFile: {
              type: 'string',
              description: 'Figma file ID',
            },
            members: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Meeting: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Meeting ID',
            },
            title: {
              type: 'string',
              description: 'Meeting title',
            },
            description: {
              type: 'string',
              description: 'Meeting description',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
            },
            duration: {
              type: 'number',
              description: 'Meeting duration in minutes',
            },
            participants: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email',
              },
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
            },
            meetingUrl: {
              type: 'string',
              description: 'Meeting join URL',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
      {
        name: 'Auth',
        description: 'Authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Documents',
        description: 'File and document management',
      },
      {
        name: 'Meetings',
        description: 'Video meetings and collaboration',
      },
      {
        name: 'Projects',
        description: 'Project management and integrations',
      },
      {
        name: 'Analytics',
        description: 'Dashboard analytics and reporting',
      },
      {
        name: 'Webhooks',
        description: 'External service webhooks',
      },
    ],
  },
  apis: [
    './src/routes/*.ts', // Path to the API routes
    './src/routes/**/*.ts', // Include subdirectories
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application, apiPrefix: string = '/api/v1'): void => {
  const docsPath = process.env.API_DOCS_PATH || '/api-docs';
  
  // Swagger UI options
  const swaggerOptions = {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .scheme-container { background: #f7f7f7; padding: 20px; }
    `,
    customSiteTitle: 'DevDesk Nexus Hub API Documentation',
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  // Setup Swagger docs
  app.use(docsPath, swaggerUi.serve);
  app.get(docsPath, swaggerUi.setup(specs, swaggerOptions));

  // JSON specification endpoint
  app.get(`${docsPath}/json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 API Documentation available at: http://localhost:${process.env.PORT || 3000}${docsPath}`);
};

export default specs; 