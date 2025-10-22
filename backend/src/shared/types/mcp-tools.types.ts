/**
 * @description Represents a tool used in the MCP (Multi-Component Processing) system.
 * @interface McpTool
 * @property name - The name of the MCP tool.
 * @property description - A brief description of the MCP tool.
 * @property inputSchema - The input schema defining the expected input structure for the tool.
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

/**
 * @description Represents an endpoint for an MCP tool.
 * @interface McpToolEndpoint
 * @property name - The name of the endpoint.
 * @property endpoint - The URL endpoint of the tool.
 * @property method - The HTTP method used to access the endpoint.
 * @property description - A brief description of the tool endpoint.
 */
export interface McpToolEndpoint {
  name: string;
  endpoint: string;
  method: string;
  description: string;
}

/**
 * @description Represents the result returned by an MCP tool after processing.
 * @interface McpToolResult
 * @property data - The data returned by the tool, including analysis, confidence, recommendations, and metadata.
 * @property status - The status of the tool execution ('success' or 'error').
 * @property meta - Metadata about the tool execution, including timestamp and optional processing time.
 */
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