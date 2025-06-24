import { injectable } from 'inversify';
import axios, { AxiosInstance } from 'axios';
import { McpTool, McpToolEndpoint, McpToolResult } from '@base/shared/types/mcp-tools.types';

@injectable()
export class McpClientService {
  private httpClient: AxiosInstance;
  private mcpServerUrl: string;

  constructor() {
    this.mcpServerUrl = process.env.MCP_SERVER_URL || 'http://mcp-server:3002';
    this.httpClient = axios.create({
      baseURL: this.mcpServerUrl,
      timeout: 60000, // Increased timeout for AI operations
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if MCP server is healthy
   * @returns True if the MCP server is healthy, false otherwise
   * @throws Error if the MCP server health check fails
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
   * @returns The list of available tools
   * @throws Error if the tools cannot be retrieved
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
   * Get list of tool endpoints
   * @returns The list of tool endpoints
   * @throws Error if the tool endpoints cannot be retrieved
   */
  async getToolEndpoints(): Promise<McpToolEndpoint[]> {
    try {
      const response = await this.httpClient.get('/tools');
      return response.data.toolEndpoints || [];
    } catch (error) {
      console.error('Failed to get MCP tool endpoints:', error);
      throw new Error('Unable to retrieve MCP tool endpoints');
    }
  }

  /**
   * Execute a tool using the generic endpoint (legacy support)
   * @param toolName - The name of the tool to execute
   * @param args - The arguments to pass to the tool
   * @returns The result of the tool execution
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<McpToolResult> {
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
   * Analyze data using the dedicated analyze-data endpoint
   * @param data - The data to analyze
   * @param analysisType - The type of analysis to perform
   * @param userRole - The role of the user (hr_manager, employee, executive, recruiter, team_lead)
   * @param urgency - The urgency of the analysis (immediate, standard, strategic)
   * @param confidentialityLevel - The confidentiality level of the analysis (public, internal, confidential, restricted)
   * @returns The result of the analysis
   */
  async analyzeData(
    data: string, 
    analysisType: string = 'capability_analysis',
    userRole: string = 'hr_manager',
    urgency: string = 'standard',
    confidentialityLevel: string = 'internal'
  ): Promise<McpToolResult> {
    try {
      const response = await this.httpClient.post('/tools/analyze-data', {
        data,
        analysisType,
        userRole,
        urgency,
        confidentialityLevel
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to analyze data:', error);
      throw new Error(`Data analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Generate report using the dedicated generate-report endpoint
   * @param data - The data to generate a report for
   * @param reportType - The type of report to generate (comprehensive, summary, detailed)
   * @param userRole - The role of the user (hr_manager, employee, executive, recruiter, team_lead)
   * @param includeMetrics - Whether to include metrics in the report
   * @param confidentialityLevel - The confidentiality level of the report (public, internal, confidential, restricted)
   * @returns The result of the report generation
   */
  async generateReport(
    data: string,
    reportType: string = 'comprehensive',
    userRole: string = 'hr_manager',
    includeMetrics: boolean = true,
    confidentialityLevel: string = 'internal'
  ): Promise<McpToolResult> {
    try {
      const response = await this.httpClient.post('/tools/generate-report', {
        data,
        reportType,
        userRole,
        includeMetrics,
        confidentialityLevel
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      throw new Error(`Report generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Perform skill benchmarking using the dedicated endpoint
   * @param data - The data to perform skill benchmarking on
   * @param industry - The industry to benchmark against
   * @param region - The region to benchmark against
   * @param includeProjections - Whether to include projections in the benchmarking
   * @returns The result of the skill benchmarking
   */
  async skillBenchmarking(
    data: string,
    industry?: string,
    region?: string,
    includeProjections: boolean = true
  ): Promise<McpToolResult> {
    try {
      const response = await this.httpClient.post('/tools/skill-benchmarking', {
        data,
        industry,
        region,
        includeProjections
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to perform skill benchmarking:', error);
      throw new Error(`Skill benchmarking failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Perform compensation analysis using the dedicated endpoint
   * @param data - The data to perform compensation analysis on
   * @param marketScope - The scope of the market to analyze (national, regional, global)
   * @param includeEquityAnalysis - Whether to include equity analysis in the compensation analysis
   * @returns The result of the compensation analysis
   */
  async compensationAnalysis(
    data: string,
    marketScope: string = 'national',
    includeEquityAnalysis: boolean = true
  ): Promise<McpToolResult> {
    try {
      const response = await this.httpClient.post('/tools/compensation-analysis', {
        data,
        marketScope,
        includeEquityAnalysis
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to perform compensation analysis:', error);
      throw new Error(`Compensation analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get analysis confidence score
   * @param data - The data to get the analysis confidence score for
   * @returns The confidence score, level, recommendations, and timestamp
   * @throws Error if the confidence analysis fails
   */
  async getAnalysisConfidence(data: string): Promise<{
    confidence: number;
    level: string;
    recommendations: string[];
    timestamp: string;
  }> {
    try {
      const response = await this.httpClient.post('/analytics/confidence', {
        data
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get analysis confidence:', error);
      throw new Error(`Confidence analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }
} 