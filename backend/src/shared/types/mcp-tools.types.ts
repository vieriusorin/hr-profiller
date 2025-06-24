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
    content: Array<{
      type: string;
      text: string;
    }>;
    metadata?: {
      analysisType?: string;
      userRole?: string;
      urgency?: string;
      confidentialityLevel?: string;
      reportType?: string;
      timestamp?: string;
      confidence?: number;
      processingTime?: string;
      tokenUsage?: number;
      version?: string;
    };
    requestInfo?: {
      toolName: string;
      timestamp: string;
      version: string;
    };
  }