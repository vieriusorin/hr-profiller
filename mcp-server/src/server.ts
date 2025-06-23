import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool
} from '@modelcontextprotocol/sdk/types.js';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import OpenAI from 'openai';


/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check for the MCP server
 *     description: Returns the health status of the MCP server.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: mcp-server
 */

/**
 * @swagger
 * /tools:
 *   get:
 *     summary: List available MCP tools
 *     description: Returns a list of all available tools exposed by the MCP server.
 *     tags:
 *       - Tools
 *     responses:
 *       200:
 *         description: List of tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tools:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       inputSchema:
 *                         type: object
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /tools/{toolName}:
 *   post:
 *     summary: Execute a tool by name
 *     description: Calls a specific tool with the provided arguments.
 *     tags:
 *       - Tools
 *     parameters:
 *       - in: path
 *         name: toolName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the tool to execute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               arguments:
 *                 type: object
 *                 description: Arguments for the tool
 *     responses:
 *       200:
 *         description: Tool execution result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

export class HttpMcpServer {
    private app = express();
    private mcpServer: Server;
    private openai: OpenAI;

    constructor() {

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.mcpServer = new Server(
            {
                name: 'profile-mcp-server',
                description: 'MCP server for profile management tools',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupMcpHandlers();
        this.setupHttpRoutes();

        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    private getAvailableTools(): Tool[] {
        return [
            {
                name: 'analyze_data',
                description: 'Analyze person data with AI using context from vector database',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string containing person data and context'
                        },
                        analysisType: {
                            type: 'string',
                            description: 'Type of analysis to perform (e.g., "capability_analysis", "skill_gap", "career_recommendation")'
                        }
                    },
                    required: ['data']
                }
            },
            {
                name: 'generate_report',
                description: 'Generate a comprehensive, structured report for a person profile using AI and context from the vector database',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string containing person data and context'
                        },
                        reportType: {
                            type: 'string',
                            description: 'Type of report to generate (e.g., "comprehensive", "summary", "market_positioning")'
                        }
                    },
                    required: ['data']
                }
            },
        ];
    }

    private setupMcpHandlers() {
        // Define your MCP tools
        this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.getAvailableTools() as Tool[]
            };
        });

        this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'analyze_data':
                    if (!args || typeof args !== 'object') {
                        throw new Error('Invalid arguments provided');
                    }
                    const data = (args as any).data;
                    const analysisType = (args as any).analysisType;

                    if (typeof data !== 'string') {
                        throw new Error('Data must be a string');
                    }

                    return await this.analyzeData(data, analysisType);
                case 'generate_report':
                    if (!args || typeof args !== 'object') {
                        throw new Error('Invalid arguments provided');
                    }
                    const reportData = (args as any).data;
                    const reportType = (args as any).reportType;
                    if (typeof reportData !== 'object') {
                        throw new Error('Data must be a object');
                    }
                    return await this.generateReport(reportData, reportType);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }

    /**
     * Analyze person data using OpenAI with context from vector database
     * This is where the AI magic happens!
     */
    private async analyzeData(data: string, analysisType?: string) {
        try {
            // Parse the context data (person info + similar people + skills context)
            const context = JSON.parse(data);

            // Create a comprehensive prompt based on analysis type
            const prompt = this.createAnalysisPrompt(context, analysisType);

            // Call OpenAI API
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert HR analyst and career advisor. Analyze the provided person data and context to provide insightful, actionable recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            const analysis = completion.choices[0]?.message?.content || 'Analysis could not be completed.';

            return {
                content: [
                    {
                        type: 'text',
                        text: analysis
                    }
                ]
            };
        } catch (error) {
            console.error('AI analysis failed:', error);
            throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a comprehensive prompt for AI analysis based on context and analysis type
     */
    private createAnalysisPrompt(context: any, analysisType?: string): string {
        const { similarPersons, skillsContext } = context;

        let basePrompt = `Please analyze the following person data and provide insights:\n\n`;

        // Add person information
        basePrompt += `**PERSON PROFILE:**\n`;
        basePrompt += `Name: ${context.firstName} ${context.lastName}\n`;
        basePrompt += `Email: ${context.email}\n`;
        basePrompt += `Position: ${context.employmentDetails?.position || 'Not specified'}\n`;
        basePrompt += `Skills: ${context.skills?.map((s: any) => s.skillName).join(', ') || 'None'}\n`;
        basePrompt += `Technologies: ${context.technologies?.map((t: any) => t.technologyName).join(', ') || 'None'}\n`;
        basePrompt += `Education: ${context.education?.map((e: any) => `${e.degree} in ${e.fieldOfStudy} from ${e.institution}`).join('; ') || 'None'}\n\n`;

        // Add similar persons context if available
        if (similarPersons && similarPersons.length > 0) {
            basePrompt += `**SIMILAR PROFESSIONALS (for context):**\n`;
            similarPersons.slice(0, 3).forEach((similar: any, index: number) => {
                basePrompt += `${index + 1}. ${similar.personName} - ${similar.similarity}% match\n`;
            });
            basePrompt += `\n`;
        }

        // Add skills context if available
        if (skillsContext) {
            basePrompt += `**SKILLS MARKET CONTEXT:**\n${skillsContext}\n\n`;
        }

        // Add analysis type specific instructions
        switch (analysisType) {
            case 'capability_analysis':
                basePrompt += `**ANALYSIS REQUEST:** Please provide a comprehensive capability analysis including:\n`;
                basePrompt += `- Current skill strengths and areas of expertise\n`;
                basePrompt += `- Potential skill gaps and development opportunities\n`;
                basePrompt += `- Career trajectory assessment\n`;
                basePrompt += `- Recommendations for skill development\n`;
                break;

            case 'skill_gap':
                basePrompt += `**ANALYSIS REQUEST:** Please identify skill gaps and provide:\n`;
                basePrompt += `- Missing skills compared to similar professionals\n`;
                basePrompt += `- Industry-relevant skills to acquire\n`;
                basePrompt += `- Learning path recommendations\n`;
                break;

            case 'career_recommendation':
                basePrompt += `**ANALYSIS REQUEST:** Please provide career recommendations including:\n`;
                basePrompt += `- Potential career paths based on current profile\n`;
                basePrompt += `- Role transitions to consider\n`;
                basePrompt += `- Industry opportunities\n`;
                basePrompt += `- Next steps for career advancement\n`;
                break;

            default:
                basePrompt += `**ANALYSIS REQUEST:** Please provide a general analysis including:\n`;
                basePrompt += `- Key strengths and areas for improvement\n`;
                basePrompt += `- Professional development suggestions\n`;
                basePrompt += `- Market positioning assessment\n`;
        }

        return basePrompt;
    }

    /**
     * Generate a comprehensive, structured report for a person profile using OpenAI
     */
    private async generateReport(data: object, reportType?: string) {
        console.log(data, 'data in generateReport')
        try {
            const context = data;
            const prompt = this.createReportPrompt(context, reportType);
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert HR analyst and report writer. Generate a comprehensive, structured report for the provided person profile and context.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 1500
            });
            const report = completion.choices[0]?.message?.content || 'Report could not be generated.';
            return {
                content: [
                    {
                        type: 'text',
                        text: report
                    }
                ]
            };
        } catch (error) {
            console.error('AI report generation failed:', error);
            throw new Error(`AI report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a comprehensive prompt for AI report generation based on context and report type
     */
    private createReportPrompt(context: any, reportType?: string): string {
        const { similarPersons, skillsContext } = context;
        console.log(context, 'context in createReportPrompt')
        let basePrompt = `Generate a detailed, structured report for the following person profile.\n\n`;
        basePrompt += `**PERSON PROFILE:**\n`;
        basePrompt += `Name: ${context.firstName} ${context.lastName}\n`;
        basePrompt += `Email: ${context.email}\n`;
        basePrompt += `Position: ${context.employmentDetails?.position || 'Not specified'}\n`;
        basePrompt += `Skills: ${context.skills?.map((s: any) => s.skillName).join(', ') || 'None'}\n`;
        basePrompt += `Technologies: ${context.technologies?.map((t: any) => t.technologyName).join(', ') || 'None'}\n`;
        basePrompt += `Education: ${context.education?.map((e: any) => `${e.degree} in ${e.fieldOfStudy} from ${e.institution}`).join('; ') || 'None'}\n\n`;
        if (similarPersons && similarPersons.length > 0) {
            basePrompt += `**SIMILAR PROFESSIONALS (for context):**\n`;
            similarPersons.slice(0, 3).forEach((similar: any, index: number) => {
                basePrompt += `${index + 1}. ${similar.personName} - ${similar.similarity}% match\n`;
            });
            basePrompt += `\n`;
        }
        if (skillsContext) {
            basePrompt += `**SKILLS MARKET CONTEXT:**\n${skillsContext}\n\n`;
        }
        switch (reportType) {
            case 'comprehensive':
                basePrompt += `**REPORT REQUEST:** Please generate a comprehensive report including:\n`;
                basePrompt += `- Executive summary\n`;
                basePrompt += `- Key strengths and expertise\n`;
                basePrompt += `- Skill gaps and development areas\n`;
                basePrompt += `- Career trajectory and recommendations\n`;
                basePrompt += `- Market positioning and opportunities\n`;
                basePrompt += `- Actionable next steps\n`;
                break;
            case 'summary':
                basePrompt += `**REPORT REQUEST:** Please generate a concise summary report including:\n`;
                basePrompt += `- Main strengths\n`;
                basePrompt += `- Key development areas\n`;
                basePrompt += `- Short recommendations\n`;
                break;
            case 'market_positioning':
                basePrompt += `**REPORT REQUEST:** Please generate a market positioning report including:\n`;
                basePrompt += `- Comparison to similar professionals\n`;
                basePrompt += `- In-demand skills\n`;
                basePrompt += `- Market opportunities\n`;
                basePrompt += `- Positioning advice\n`;
                break;
            default:
                basePrompt += `**REPORT REQUEST:** Please generate a general report including:\n`;
                basePrompt += `- Key findings\n`;
                basePrompt += `- Recommendations\n`;
        }
        return basePrompt;
    }

    private setupHttpRoutes() {
        this.app.use(express.json());

        /**
         * @swagger
         * /health:
         *   get:
         *     summary: Health check for the MCP server
         *     description: Returns the health status of the MCP server.
         *     tags:
         *       - Health
         *     responses:
         *       200:
         *         description: Server is healthy
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: healthy
         *                 service:
         *                   type: string
         *                   example: mcp-server
         */
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({ status: 'healthy', service: 'mcp-server' });
        });

        /**
         * @swagger
         * /tools:
         *   get:
         *     summary: List available MCP tools
         *     description: Returns a list of all available tools exposed by the MCP server.
         *     tags:
         *       - Tools
         *     responses:
         *       200:
         *         description: List of tools
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 tools:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       name:
         *                         type: string
         *                       description:
         *                         type: string
         *                       inputSchema:
         *                         type: object
         *       500:
         *         $ref: '#/components/responses/InternalServerError'
         */
        this.app.get('/tools', async (req: Request, res: Response) => {
            try {
                const tools = this.getAvailableTools()
                res.json({ tools });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                res.status(500).json({ error: errorMessage });
            }
        });

        /**
         * @swagger
         * /tools/{toolName}:
         *   post:
         *     summary: Execute a tool by name
         *     description: Calls a specific tool with the provided arguments.
         *     tags:
         *       - Tools
         *     parameters:
         *       - in: path
         *         name: toolName
         *         required: true
         *         schema:
         *           type: string
         *         description: Name of the tool to execute
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               arguments:
         *                 type: object
         *                 description: Arguments for the tool
         *     responses:
         *       200:
         *         description: Tool execution result
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *       500:
         *         $ref: '#/components/responses/InternalServerError'
         */
        this.app.post('/tools/:toolName', async (req: Request, res: Response) => {
            try {
                const { toolName } = req.params;
                const { arguments: args } = req.body;

                // Execute tools directly instead of using the unconnected MCP server
                switch (toolName) {
                    case 'analyze_data':
                        if (!args || typeof args !== 'object') {
                            throw new Error('Invalid arguments provided');
                        }
                        const data = (args as any).data;
                        const analysisType = (args as any).analysisType;

                        if (typeof data !== 'string') {
                            throw new Error('Data must be a string');
                        }

                        const result = await this.analyzeData(data, analysisType);
                        res.json(result);
                        break;
                    case 'generate_report':
                        if (!args || typeof args !== 'object') {
                            throw new Error('Invalid arguments provided');
                        }
                        const reportData = (args as any).data;
                        const reportType = (args as any).reportType;
                        if (typeof reportData !== 'object') {
                            throw new Error('Data must be a object');
                        }
                        const reportResult = await this.generateReport(reportData, reportType);
                        res.json(reportResult);
                        break;
                    default:
                        res.status(404).json({ error: `Unknown tool: ${toolName}` });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                res.status(500).json({ error: errorMessage });
            }
        });
    }

    async start(port: number = 3002) {
        return new Promise<void>((resolve) => {
            this.app.listen(port, () => {
                console.log(`MCP Server running on port ${port}`);
                console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
                resolve();
            });
        });
    }

    // For stdio communication (alternative to HTTP)
    async startStdio() {
        const transport = new StdioServerTransport();
        await this.mcpServer.connect(transport);
    }
}

// Start the server
const server = new HttpMcpServer();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
server.start(port);
