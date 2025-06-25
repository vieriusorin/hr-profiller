export interface McpTool {
    name: string;
    description: string;
    inputSchema: any;
  }
  
  export interface McpToolEndpoint {
    name: string;
    endpoint: string;
    method: string;
    description: string;
  }
  
  export interface McpToolResult {
    data: {
      analysis: string;
      confidence: number;
      recommendations: string[];
      metadata: {
        analysisType: string;
        userRole: string;
        urgency: string;
        confidentialityLevel: string;
        processingTime: number;
        modelUsed: string;
        tokensUsed: number;
        timestamp: string;
      };
    };
    status: 'success' | 'error';
    meta: {
      timestamp: string;
      processingTime?: number;
    };
  }