import { injectable } from 'inversify';
import axios, { AxiosInstance } from 'axios';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface McpToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

@injectable()
export class McpClientService {
  private httpClient: AxiosInstance;
  private mcpServerUrl: string;

  constructor() {
    this.mcpServerUrl = process.env.MCP_SERVER_URL || 'http://mcp-server:3002';
    this.httpClient = axios.create({
      baseURL: this.mcpServerUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if MCP server is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('MCP server health check failed:', error);
      return false;
    }
  }

  /**
   * Get list of available tools from MCP server
   */
  async getAvailableTools(): Promise<McpTool[]> {
    try {
      const response = await this.httpClient.get('/tools');
      return response.data.tools || [];
    } catch (error) {
      console.error('Failed to get MCP tools:', error);
      throw new Error('Unable to retrieve MCP tools');
    }
  }

  /**
   * Execute a tool on the MCP server
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<McpToolResult> {
    console.log(args, 'executeTool')
    try {
      const response = await this.httpClient.post(`/tools/${toolName}`, {
        arguments: args
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to execute MCP tool ${toolName}:`, error);
      throw new Error(`Tool execution failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Analyze data using MCP server
   */
  async analyzeData(data: string, analysisType?: string): Promise<string> {
    const result = await this.executeTool('analyze_data', {
      data,
      analysisType
    });

    return result.content?.[0]?.text || 'Analysis completed';
  }

  /**
   * Generate report using MCP server
   */
  async generateReport(reportType: string, parameters: Record<string, any>): Promise<string> {
    console.log(reportType, parameters, 'generateReport')
    const result = await this.executeTool('generate_report', {
      data: parameters,
      reportType
    });
    return result.content?.[0]?.text || 'Report generated';
  }
} 