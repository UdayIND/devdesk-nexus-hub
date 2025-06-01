interface RenderService {
  id: string;
  name: string;
  type: string;
  env: string;
  region: string;
  plan: string;
  autoDeploy: string;
  branch: string;
  buildCommand: string;
  startCommand: string;
  repo: string;
  createdAt: string;
  updatedAt: string;
  serviceDetails: {
    url: string;
    buildStatus: string;
    health: string;
  };
}

interface RenderDeploy {
  id: string;
  commit: {
    id: string;
    message: string;
    createdAt: string;
  };
  status: string;
  finishedAt: string;
  createdAt: string;
}

class RenderAPI {
  private apiKey: string;
  private baseUrl = 'https://api.render.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Render API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all services for the authenticated user
  async getServices(): Promise<RenderService[]> {
    const data = await this.makeRequest('/services');
    return data.services || [];
  }

  // Get a specific service by name or URL
  async getServiceByName(serviceName: string): Promise<RenderService | null> {
    const services = await this.getServices();
    return services.find(service => 
      service.name.toLowerCase() === serviceName.toLowerCase()
    ) || null;
  }

  // Get service by URL (extract service name from URL)
  async getServiceByUrl(serviceUrl: string): Promise<RenderService | null> {
    try {
      const url = new URL(serviceUrl);
      const serviceName = url.hostname.split('.')[0]; // Extract subdomain as service name
      return await this.getServiceByName(serviceName);
    } catch (error) {
      console.error('Invalid service URL:', error);
      return null;
    }
  }

  // Get service details including health status
  async getServiceDetails(serviceId: string) {
    return await this.makeRequest(`/services/${serviceId}`);
  }

  // Get recent deploys for a service
  async getServiceDeploys(serviceId: string, limit = 10): Promise<RenderDeploy[]> {
    const data = await this.makeRequest(`/services/${serviceId}/deploys?limit=${limit}`);
    return data.deploys || [];
  }

  // Get service metrics (if available)
  async getServiceMetrics(serviceId: string, period = '1h') {
    try {
      return await this.makeRequest(`/services/${serviceId}/metrics?period=${period}`);
    } catch (error) {
      // Metrics might not be available for all plans
      console.warn('Metrics not available:', error);
      return null;
    }
  }

  // Trigger a new deployment
  async triggerDeploy(serviceId: string) {
    return await this.makeRequest(`/services/${serviceId}/deploys`, {
      method: 'POST',
    });
  }

  // Get service logs
  async getServiceLogs(serviceId: string, limit = 100) {
    try {
      return await this.makeRequest(`/services/${serviceId}/logs?limit=${limit}`);
    } catch (error) {
      console.warn('Logs not available:', error);
      return null;
    }
  }

  // Check service health by making a request to the service URL
  async checkServiceHealth(serviceUrl: string): Promise<{
    status: 'healthy' | 'unhealthy' | 'unknown';
    responseTime: number;
    statusCode?: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(serviceUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        responseTime,
      };
    }
  }

  // Get service environment variables
  async getServiceEnvVars(serviceId: string) {
    try {
      return await this.makeRequest(`/services/${serviceId}/env-vars`);
    } catch (error) {
      console.warn('Environment variables not accessible:', error);
      return null;
    }
  }

  // Update service environment variables
  async updateServiceEnvVars(serviceId: string, envVars: Record<string, string>) {
    try {
      return await this.makeRequest(`/services/${serviceId}/env-vars`, {
        method: 'PUT',
        body: JSON.stringify(envVars),
      });
    } catch (error) {
      console.error('Failed to update environment variables:', error);
      throw error;
    }
  }
}

// Hook for using Render API in React components
export const useRenderAPI = () => {
  const apiKey = process.env.RENDER_API_KEY || '';
  const serviceUrl = process.env.RENDER_SERVICE_URL || '';
  const serviceName = process.env.RENDER_SERVICE_NAME || '';

  if (!apiKey) {
    console.warn('RENDER_API_KEY not found in environment variables');
  }

  const renderAPI = new RenderAPI(apiKey);

  const getServiceInfo = async () => {
    try {
      let service = null;
      
      if (serviceName) {
        service = await renderAPI.getServiceByName(serviceName);
      } else if (serviceUrl) {
        service = await renderAPI.getServiceByUrl(serviceUrl);
      }

      if (!service) {
        throw new Error('Service not found');
      }

      const [deploys, health] = await Promise.all([
        renderAPI.getServiceDeploys(service.id, 5),
        serviceUrl ? renderAPI.checkServiceHealth(serviceUrl) : null,
      ]);

      return {
        service,
        deploys,
        health,
      };
    } catch (error) {
      console.error('Failed to get service info:', error);
      throw error;
    }
  };

  const triggerDeploy = async () => {
    try {
      let service = null;
      
      if (serviceName) {
        service = await renderAPI.getServiceByName(serviceName);
      } else if (serviceUrl) {
        service = await renderAPI.getServiceByUrl(serviceUrl);
      }

      if (!service) {
        throw new Error('Service not found');
      }

      return await renderAPI.triggerDeploy(service.id);
    } catch (error) {
      console.error('Failed to trigger deploy:', error);
      throw error;
    }
  };

  return {
    renderAPI,
    getServiceInfo,
    triggerDeploy,
    isConfigured: !!apiKey && (!!serviceUrl || !!serviceName),
  };
};

export default RenderAPI; 