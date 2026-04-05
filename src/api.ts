const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  user_id?: string;
  tenant_id?: string;
}

export interface ChatResponse {
  response: string;
  sql?: string;
  results?: Array<Record<string, any>>;
  chart_data?: {
    type: string;
    data: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    };
  };
  memory_applied?: string[];
}

export interface UploadResponse {
  filename: string;
  rows: number;
  columns: string[];
  sample_data: Array<Record<string, any>>;
}

export interface TableInfo {
  name: string;
  type: string;
}

export interface TablesResponse {
  tables: Record<string, TableInfo[]>;
}

export interface MemoryResponse {
  memories: Array<Record<string, any>>;
  total_count: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadFile(file: File, token?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.detail || `Upload failed: ${response.status}`;
      
      // Provide more specific error messages
      if (errorMessage.includes('decode') || errorMessage.includes('codec')) {
        throw new Error('File encoding error. Please save your CSV as UTF-8 format and try again.');
      } else if (errorMessage.includes('Only CSV and JSON files are supported')) {
        throw new Error('Please upload a CSV or JSON file.');
      } else if (response.status === 413) {
        throw new Error('File is too large. Please upload a smaller file.');
      } else {
        throw new Error(errorMessage);
      }
    }

    return response.json();
  }

  async getTables(token?: string): Promise<TablesResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return this.request<TablesResponse>('/tables', { headers })
  }

  async chat(request: ChatRequest, token?: string): Promise<ChatResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })
  }

  async getMemory(userId: string = 'default_user', tenantId: string = 'default_tenant'): Promise<MemoryResponse> {
    const params = new URLSearchParams({ user_id: userId, tenant_id: tenantId });
    return this.request<MemoryResponse>(`/memory?${params}`);
  }

  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    return this.request('/health');
  }
}

export const api = new ApiClient();
