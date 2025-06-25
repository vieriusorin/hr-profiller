"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMcpServer = void 0;
require("dotenv/config");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("./swagger.config");
const openai_1 = __importDefault(require("openai"));
const enhanced_propmpt_engine_1 = require("./enhanced-propmpt-engine");
const protectPage_middleware_1 = require("./middlewares/protectPage.middleware");
const authorization_middleware_1 = require("./middlewares/authorization.middleware");
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check for the Enhanced MCP server
 *     description: Returns the health status of the Enhanced MCP server with AI capabilities.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy with AI capabilities active
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
 *                   example: enhanced-hr-mcp-server
 *                 capabilities:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["advanced_analysis", "executive_reports", "market_intelligence"]
 */
/**
 * @swagger
 * /tools:
 *   get:
 *     summary: List available Enhanced MCP tools
 *     description: Returns a list of all advanced HR analytics tools with AI-powered insights.
 *     tags:
 *       - Tools
 *     responses:
 *       200:
 *         description: List of enhanced tools with AI capabilities
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
 *                       capabilities:
 *                         type: array
 *                         items:
 *                           type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
class HttpMcpServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        // Initialize the enhanced prompt engine
        this.promptEngine = new enhanced_propmpt_engine_1.EnhancedHRPromptEngine();
        // Setup Express middleware
        this.setupExpressMiddleware();
        this.mcpServer = new index_js_1.Server({
            name: 'enhanced-hr-mcp-server',
            description: 'Enhanced MCP server for advanced HR analytics, talent intelligence, and strategic workforce planning',
            version: '2.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupMcpHandlers();
        this.setupHttpRoutes();
        // Protect Swagger UI with authentication (admin only)
        this.app.use('/api-docs', protectPage_middleware_1.protectPageWithSession, (0, authorization_middleware_1.authorize)(['admin']), swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec));
    }
    setupExpressMiddleware() {
        // CORS configuration to allow frontend access
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
        ];
        this.app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps, curl requests, or Postman)
                if (!origin)
                    return callback(null, true);
                // In development, be more permissive
                if (process.env.NODE_ENV === 'development') {
                    // Allow localhost and 127.0.0.1 with any port
                    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                        return callback(null, true);
                    }
                }
                // Check against allowed origins
                if (allowedOrigins.indexOf(origin) !== -1) {
                    return callback(null, true);
                }
                // Allow the server's own origin for Swagger UI
                if (origin.includes(`http://localhost:${process.env.PORT || 3002}`)) {
                    return callback(null, true);
                }
                console.log(`CORS: Rejecting origin: ${origin}`);
                return callback(new Error('Not allowed by CORS'));
            },
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
            credentials: true,
        }));
        // Parse JSON and cookies
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    getAvailableTools() {
        return [
            {
                name: 'analyze_data',
                description: 'Advanced AI-powered talent analysis with contextual intelligence, market positioning, and strategic recommendations using role-specific AI personas',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string containing comprehensive person data, similar professionals context, and market intelligence'
                        },
                        analysisType: {
                            type: 'string',
                            description: 'Type of advanced analysis to perform',
                            enum: [
                                'capability_analysis',
                                'skill_gap',
                                'career_recommendation',
                                'performance_optimization',
                                'succession_planning',
                                'diversity_analytics',
                                'compensation_equity',
                                'hipo_identification',
                                'culture_fit',
                                'retention_risk',
                                'team_dynamics'
                            ]
                        },
                        userRole: {
                            type: 'string',
                            description: 'User role for contextual AI persona selection',
                            enum: ['hr_manager', 'employee', 'executive', 'recruiter', 'team_lead'],
                            default: 'hr_manager'
                        },
                        urgency: {
                            type: 'string',
                            description: 'Analysis urgency level affecting AI model selection',
                            enum: ['immediate', 'standard', 'strategic'],
                            default: 'standard'
                        },
                        confidentialityLevel: {
                            type: 'string',
                            description: 'Data confidentiality level',
                            enum: ['public', 'internal', 'confidential', 'restricted'],
                            default: 'internal'
                        }
                    },
                    required: ['data']
                }
            },
            {
                name: 'generate_report',
                description: 'Generate executive-level, comprehensive talent reports with strategic insights, ROI analysis, and actionable roadmaps using advanced AI frameworks',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string containing person profile, market context, and competitive intelligence'
                        },
                        reportType: {
                            type: 'string',
                            description: 'Report format and depth with executive-level insights',
                            enum: [
                                'comprehensive',
                                'executive_brief',
                                'development_plan',
                                'market_analysis',
                                'succession_planning',
                                'diversity_impact',
                                'compensation_review'
                            ],
                            default: 'comprehensive'
                        },
                        userRole: {
                            type: 'string',
                            description: 'Target audience for report customization',
                            enum: ['hr_manager', 'employee', 'executive', 'board', 'team_lead'],
                            default: 'hr_manager'
                        },
                        includeMetrics: {
                            type: 'boolean',
                            description: 'Include detailed metrics, KPIs, and ROI calculations',
                            default: true
                        },
                        confidentialityLevel: {
                            type: 'string',
                            description: 'Report confidentiality level',
                            enum: ['public', 'internal', 'confidential', 'restricted'],
                            default: 'internal'
                        }
                    },
                    required: ['data']
                }
            },
            {
                name: 'skill_benchmarking',
                description: 'Advanced skill benchmarking against industry standards, market rates, and peer groups with predictive analytics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string with person skills, experience, and context'
                        },
                        industry: {
                            type: 'string',
                            description: 'Target industry for benchmarking analysis'
                        },
                        region: {
                            type: 'string',
                            description: 'Geographic region for market comparison'
                        },
                        includeProjections: {
                            type: 'boolean',
                            description: 'Include future skill demand projections',
                            default: true
                        }
                    },
                    required: ['data']
                }
            },
            {
                name: 'compensation_analysis',
                description: 'Comprehensive compensation analysis with market rates, equity assessment, and negotiation strategies',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string with role, skills, experience, and location data'
                        },
                        marketScope: {
                            type: 'string',
                            description: 'Market scope for compensation analysis',
                            enum: ['local', 'national', 'global'],
                            default: 'national'
                        },
                        includeEquityAnalysis: {
                            type: 'boolean',
                            description: 'Include internal equity and bias analysis',
                            default: true
                        }
                    },
                    required: ['data']
                }
            }
        ];
    }
    setupMcpHandlers() {
        this.mcpServer.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: this.getAvailableTools()
            };
        });
        this.mcpServer.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'analyze_data':
                    if (!args || typeof args !== 'object') {
                        throw new Error('Invalid arguments provided');
                    }
                    const { data, analysisType, userRole, urgency, confidentialityLevel } = args;
                    if (typeof data !== 'string') {
                        throw new Error('Data must be a JSON string');
                    }
                    return await this.enhancedAnalyzeData(data, analysisType || 'capability_analysis', userRole || 'hr_manager', urgency || 'standard', confidentialityLevel || 'internal');
                case 'generate_report':
                    if (!args || typeof args !== 'object') {
                        throw new Error('Invalid arguments provided');
                    }
                    const { data: reportData, reportType, userRole: reportUserRole, includeMetrics, confidentialityLevel: reportConfidentiality } = args;
                    if (typeof reportData !== 'string') {
                        throw new Error('Data must be a JSON string');
                    }
                    return await this.enhancedGenerateReport(reportData, reportType || 'comprehensive', reportUserRole || 'hr_manager', includeMetrics !== false, reportConfidentiality || 'internal');
                case 'skill_benchmarking':
                    if (!args || typeof args !== 'object') {
                        throw new Error('Invalid arguments provided');
                    }
                    const { data: skillData, industry, region, includeProjections } = args;
                    if (typeof skillData !== 'string') {
                        throw new Error('Data must be a JSON string');
                    }
                    return await this.skillBenchmarking(skillData, industry, region, includeProjections !== false);
                case 'compensation_analysis':
                    if (!args || typeof args !== 'object') {
                        throw new Error('Invalid arguments provided');
                    }
                    const { data: compData, marketScope, includeEquityAnalysis } = args;
                    if (typeof compData !== 'string') {
                        throw new Error('Data must be a JSON string');
                    }
                    return await this.compensationAnalysis(compData, marketScope || 'national', includeEquityAnalysis !== false);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    /**
    * This method performs advanced AI-powered analysis on talent data, leveraging contextual intelligence and market insights.
    * It supports various analysis types such as capability analysis, skill gap identification, and performance optimization.
    * It uses role-specific AI personas to tailor the analysis based on the user's role (e.g., HR manager, employee, executive).
    * It also incorporates urgency levels to select the optimal AI model and parameters for the analysis.
    * @param data - JSON string containing comprehensive person data, similar professionals context, and market intelligence
    * @param analysisType - Type of advanced analysis to perform (e.g., capability_analysis, skill_gap, career_recommendation)
    * @param userRole - User role for contextual AI persona selection (e.g., hr_manager, employee, executive)
    * @param urgency - Analysis urgency level affecting AI model selection (e.g., immediate, standard, strategic)
    * @param confidentialityLevel - Data confidentiality level (e.g., public, internal, confidential, restricted)
    * @returns A structured analysis object containing the generated content and metadata
    * @throws Error if analysis fails
     */
    async enhancedAnalyzeData(data, analysisType = 'capability_analysis', userRole = 'hr_manager', urgency = 'standard', confidentialityLevel = 'internal') {
        try {
            const startTime = Date.now();
            // Handle both JSON object data and plain text data
            let context;
            try {
                context = JSON.parse(data);
            }
            catch (parseError) {
                // If parsing fails, treat as plain text and create a minimal context
                context = {
                    rawData: data,
                    analysisData: data,
                    parseMethod: 'plain_text'
                };
            }
            const enrichedContext = await this.enrichContext(context);
            // Create advanced prompt using the enhanced engine
            const prompt = this.promptEngine.createAdvancedAnalysisPrompt(enrichedContext, analysisType, userRole);
            // Get optimal model configuration based on urgency and complexity
            const modelConfig = this.getOptimalModelConfig(urgency, analysisType);
            // Enhanced OpenAI API call with optimized parameters
            const completion = await this.openai.chat.completions.create({
                model: modelConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: this.promptEngine.getSystemPrompt(userRole)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: modelConfig.temperature,
                max_tokens: modelConfig.maxTokens,
                presence_penalty: 0.1,
                frequency_penalty: 0.1,
                top_p: 0.9
            });
            const analysis = completion.choices[0]?.message?.content || 'Analysis could not be completed.';
            const processingTime = Date.now() - startTime;
            return {
                content: [
                    {
                        type: 'text',
                        text: analysis
                    }
                ],
                metadata: {
                    analysisType,
                    userRole,
                    urgency,
                    confidentialityLevel,
                    timestamp: new Date().toISOString(),
                    confidence: this.calculateConfidenceScore(enrichedContext),
                    processingTime: `${processingTime}ms`,
                    model: modelConfig.model,
                    tokenUsage: completion.usage?.total_tokens || 0,
                    version: '2.0.0-enhanced'
                }
            };
        }
        catch (error) {
            console.error('Enhanced AI analysis failed:', error);
            throw new Error(`Enhanced AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * This method leverages advanced AI capabilities to produce high-quality reports that can be used for strategic decision-making, performance reviews, and talent management.
     * It incorporates contextual analysis, market intelligence, and benchmarking data to provide a comprehensive view of the subject matter.
     * It also supports multi-step report generation for complex analyses, ensuring that the output is both detailed and actionable.
     * It supports multiple report types and user roles, allowing for tailored outputs based on the audience.
     * @param data - JSON string containing person profile, market context, and competitive intelligence
     * @param reportType - Type of report to generate (e.g., comprehensive, executive brief)
     * @param userRole - Role of the user for contextual AI persona selection (e.g., hr_manager, employee, executive)
     * @param includeMetrics - Whether to include detailed metrics, KPIs, and ROI calculations in the report
     * @param confidentialityLevel - Level of confidentiality for the report (e.g., public, internal, confidential, restricted)
     * @returns A structured report object containing the generated content and metadata
     * @throws Error if report generation fails
     */
    async enhancedGenerateReport(data, reportType = 'comprehensive', userRole = 'hr_manager', includeMetrics = true, confidentialityLevel = 'internal') {
        try {
            const startTime = Date.now();
            // Handle both JSON object data and plain text data
            let context;
            try {
                context = JSON.parse(data);
            }
            catch (parseError) {
                // If parsing fails, treat as plain text and create a minimal context
                context = {
                    rawData: data,
                    reportData: data,
                    parseMethod: 'plain_text'
                };
            }
            const enrichedContext = await this.enrichContext(context);
            // For complex reports, use multi-step generation
            if (reportType === 'comprehensive' || reportType === 'executive_brief') {
                return await this.generateMultiStepReport(enrichedContext, reportType, userRole, includeMetrics, confidentialityLevel);
            }
            // Create advanced report prompt
            const prompt = this.promptEngine.createAdvancedReportPrompt(enrichedContext, reportType, userRole);
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: this.promptEngine.getSystemPrompt(userRole)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3, // Lower temperature for reports
                max_tokens: 3500,
                presence_penalty: 0.2,
                frequency_penalty: 0.1
            });
            const report = completion.choices[0]?.message?.content || 'Report could not be generated.';
            const processingTime = Date.now() - startTime;
            return {
                content: [
                    {
                        type: 'text',
                        text: report
                    }
                ],
                metadata: {
                    reportType,
                    userRole,
                    includeMetrics,
                    confidentialityLevel,
                    timestamp: new Date().toISOString(),
                    wordCount: report.split(' ').length,
                    estimatedReadTime: `${Math.ceil(report.split(' ').length / 200)} minutes`,
                    processingTime: `${processingTime}ms`,
                    tokenUsage: completion.usage?.total_tokens || 0,
                    version: '2.0.0-enhanced'
                }
            };
        }
        catch (error) {
            console.error('Enhanced AI report generation failed:', error);
            throw new Error(`Enhanced AI report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Advanced skill benchmarking with market intelligence
     */
    async skillBenchmarking(data, industry, region, includeProjections = true) {
        try {
            // Handle both JSON object data and plain text data
            let context;
            try {
                context = JSON.parse(data);
            }
            catch (parseError) {
                // If parsing fails, treat as plain text and create a minimal context
                context = {
                    rawData: data,
                    skillText: data,
                    parseMethod: 'plain_text'
                };
            }
            const enrichedContext = await this.enrichContext(context);
            const prompt = `
🎯 **ADVANCED SKILL BENCHMARKING ANALYSIS**
═══════════════════════════════════════════════════════════════

**BENCHMARKING PARAMETERS:**
Industry: ${industry || 'Technology (Default)'}
Region: ${region || 'Global'}
Include Projections: ${includeProjections ? 'Yes' : 'No'}

**CANDIDATE PROFILE:**
${this.buildCandidateProfileSummary(context)}

**ANALYSIS REQUIREMENTS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 **Skill Competitiveness Analysis:**
- Rate each skill against industry standards (1-10 scale)
- Identify top-tier, competitive, and developing skills
- Map skills to market demand and salary premiums

📊 **Market Positioning Assessment:**
- Compare against peer profiles in similar roles
- Identify unique skill combinations and differentiators
- Assess market scarcity and value of skill portfolio

🚀 **Growth Trajectory Projections:**
- Project skill relevance over next 3-5 years
- Identify emerging skills to acquire for future-proofing
- Recommend strategic skill investments and development priorities

💰 **Economic Impact Analysis:**
- Estimate salary impact of current skill portfolio
- Calculate ROI of skill development investments
- Benchmark compensation potential against market rates

Provide detailed benchmarking analysis with scores, projections, and strategic recommendations.
            `;
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a senior talent analytics consultant specializing in skill benchmarking and market intelligence. Provide data-driven insights with specific metrics and actionable recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 2500
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: completion.choices[0]?.message?.content || 'Benchmarking analysis could not be completed.'
                    }
                ],
                metadata: {
                    analysisType: 'skill_benchmarking',
                    industry,
                    region,
                    includeProjections,
                    timestamp: new Date().toISOString(),
                    tokenUsage: completion.usage?.total_tokens || 0
                }
            };
        }
        catch (error) {
            console.error('Skill benchmarking failed:', error);
            throw new Error(`Skill benchmarking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Comprehensive compensation analysis
     */
    async compensationAnalysis(data, marketScope = 'national', includeEquityAnalysis = true) {
        try {
            // Handle both JSON object data and plain text data
            let context;
            try {
                context = JSON.parse(data);
            }
            catch (parseError) {
                // If parsing fails, treat as plain text and create a minimal context
                context = {
                    rawData: data,
                    compensationData: data,
                    parseMethod: 'plain_text'
                };
            }
            const enrichedContext = await this.enrichContext(context);
            const prompt = `
💰 **COMPREHENSIVE COMPENSATION ANALYSIS**
═══════════════════════════════════════════════════════════════

**ANALYSIS PARAMETERS:**
Market Scope: ${marketScope.toUpperCase()}
Include Equity Analysis: ${includeEquityAnalysis ? 'Yes' : 'No'}

**CANDIDATE PROFILE:**
${this.buildCandidateProfileSummary(context)}

**COMPENSATION ANALYSIS REQUIREMENTS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **Market Rate Analysis:**
- Benchmark against industry salary data (25th, 50th, 75th, 90th percentiles)
- Compare total compensation packages (base, bonus, equity, benefits)
- Analyze geographic and cost-of-living adjustments

⚖️ **Pay Equity Assessment:**
- Review for potential internal equity gaps
- Ensure compliance with pay equity legislation
- Analyze compensation vs. performance and experience ratios

🎯 **Negotiation Strategy:**
- Recommend optimal salary range and negotiation points
- Identify strongest value propositions for compensation discussions
- Suggest alternative compensation structures and benefits

📈 **Growth Projections:**
- Project salary growth trajectory over 3-5 years
- Identify compensation acceleration opportunities
- Compare growth potential across different career paths

Provide detailed compensation analysis with specific recommendations and market data.
            `;
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a compensation analyst with expertise in market benchmarking, pay equity, and strategic compensation planning. Provide precise, legally compliant recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2500
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: completion.choices[0]?.message?.content || 'Compensation analysis could not be completed.'
                    }
                ],
                metadata: {
                    analysisType: 'compensation_analysis',
                    marketScope,
                    includeEquityAnalysis,
                    timestamp: new Date().toISOString(),
                    tokenUsage: completion.usage?.total_tokens || 0
                }
            };
        }
        catch (error) {
            console.error('Compensation analysis failed:', error);
            throw new Error(`Compensation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Multi-step report generation for complex analysis
     */
    async generateMultiStepReport(context, reportType, userRole, includeMetrics, confidentialityLevel) {
        try {
            // Step 1: Generate executive summary
            const summaryPrompt = this.promptEngine.createAdvancedReportPrompt(context, reportType, userRole) +
                '\n\nFOCUS: Generate ONLY the executive summary section (300-400 words) with key findings and strategic recommendations.';
            const summaryCompletion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: this.promptEngine.getSystemPrompt(userRole) },
                    { role: 'user', content: summaryPrompt }
                ],
                temperature: 0.3,
                max_tokens: 700
            });
            // Step 2: Generate detailed analysis
            const detailPrompt = this.promptEngine.createAdvancedReportPrompt(context, reportType, userRole) +
                `\n\nFOCUS: Generate the detailed analysis sections (excluding executive summary). Build upon this executive summary:\n\n${summaryCompletion.choices[0]?.message?.content}`;
            const detailCompletion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: this.promptEngine.getSystemPrompt(userRole) },
                    { role: 'user', content: detailPrompt }
                ],
                temperature: 0.4,
                max_tokens: 3000
            });
            const fullReport = `${summaryCompletion.choices[0]?.message?.content}\n\n${detailCompletion.choices[0]?.message?.content}`;
            return {
                content: [{ type: 'text', text: fullReport }],
                metadata: {
                    reportType,
                    userRole,
                    includeMetrics,
                    confidentialityLevel,
                    generationMethod: 'multi-step',
                    sections: ['executive_summary', 'detailed_analysis'],
                    totalTokens: (summaryCompletion.usage?.total_tokens || 0) + (detailCompletion.usage?.total_tokens || 0),
                    timestamp: new Date().toISOString(),
                    version: '2.0.0-enhanced'
                }
            };
        }
        catch (error) {
            console.error('Multi-step report generation failed:', error);
            throw new Error(`Multi-step report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Context enrichment with market intelligence and benchmarking data
     */
    async enrichContext(context) {
        try {
            // Add market salary data if position is available
            if (context.employmentDetails?.position) {
                context.marketData = await this.fetchMarketData(context.employmentDetails.position);
            }
            // Add industry benchmarks for skills
            if (context.skills?.length > 0) {
                context.industryBenchmarks = await this.fetchIndustryBenchmarks(context.skills);
            }
            // Add learning recommendations
            context.learningRecommendations = await this.generateLearningRecommendations(context);
            // Add competitive intelligence
            if (context.similarPersons?.length > 0) {
                context.competitiveIntelligence = await this.analyzeCompetitiveLandscape(context.similarPersons);
            }
            return context;
        }
        catch (error) {
            console.warn('Context enrichment failed, proceeding with basic context:', error);
            return context;
        }
    }
    /**
     * Dynamic model configuration based on request complexity and urgency
     * @param urgency - Urgency level of the analysis (immediate, standard, strategic)
     * @param analysisType - Type of analysis being performed (optional)
     * @return Optimal model configuration for the request
     * This method selects the most appropriate AI model and parameters based on the urgency and complexity of the analysis requested.
     * It considers the type of analysis to determine if a more complex model is needed, especially for strategic or detailed reports.
     */
    getOptimalModelConfig(urgency, analysisType) {
        const complexAnalysisTypes = ['succession_planning', 'diversity_analytics', 'compensation_equity'];
        const isComplex = complexAnalysisTypes.includes(analysisType || '');
        const configs = {
            immediate: {
                model: 'gpt-4o-mini', // Fast, cost-effective for quick insights
                temperature: 0.3, // Lower for consistent, factual responses
                maxTokens: 1500
            },
            standard: {
                model: isComplex ? 'gpt-4o' : 'gpt-4o-mini', // Scale based on complexity
                temperature: 0.5, // Balanced for analysis
                maxTokens: isComplex ? 3000 : 2000
            },
            strategic: {
                model: 'gpt-4o', // Most capable model for strategic decisions
                temperature: 0.6, // Slightly higher for strategic creativity
                maxTokens: 4500 // More tokens for comprehensive analysis
            }
        };
        return configs[urgency] || configs.standard;
    }
    /**
     * Calculate confidence score based on data completeness and quality
     * This method evaluates the provided context to determine a confidence score that reflects the completeness and quality of the data available for analysis.
     * It considers various factors such as the presence of skills, technologies, education, work history, similar persons, and additional market data.
     * The score is calculated as a weighted sum of these factors, providing a numerical representation of the confidence in the analysis that can be performed.
     * @param context - The context object containing various data points about the person
     * @return A confidence score between 0 and 100, where higher scores indicate more complete and reliable data for analysis.
     * This score can be used to gauge the reliability of the analysis results and to prioritize data collection efforts.
     */
    calculateConfidenceScore(context) {
        let score = 0;
        const factors = [
            { field: 'skills', weight: 20, present: context.skills?.length > 0 },
            { field: 'technologies', weight: 15, present: context.technologies?.length > 0 },
            { field: 'education', weight: 15, present: context.education?.length > 0 },
            { field: 'workHistory', weight: 20, present: context.workHistory?.length > 0 },
            { field: 'similarPersons', weight: 15, present: context.similarPersons?.length > 0 },
            { field: 'skillsContext', weight: 10, present: !!context.skillsContext },
            { field: 'marketData', weight: 5, present: !!context.marketData }
        ];
        factors.forEach(factor => {
            if (factor.present)
                score += factor.weight;
        });
        return Math.round(score);
    }
    /**
     * Helper methods for data integration (implement based on your data sources)
     * These methods should integrate with external APIs or databases to fetch market data, industry benchmarks, and other relevant information.
     * They can be implemented using libraries like axios or node-fetch to make HTTP requests to salary APIs, industry benchmarks, or learning platforms.
     * @param position - The job position for which market data is being fetched
     * @return A promise that resolves to a string containing market intelligence data for the specified position.
     * This method should return relevant market intelligence such as average salary ranges, demand trends, and key skills in the market.
     */
    async fetchMarketData(position) {
        // Integrate with salary APIs like Glassdoor, PayScale, etc.
        return `Market intelligence for ${position}: Avg salary $75K-$120K (varies by experience/location). High demand with 15% YoY growth. Key skills premium: Cloud, AI/ML, Leadership.`;
    }
    async fetchIndustryBenchmarks(skills) {
        // Integrate with industry benchmark APIs
        const topSkills = skills.slice(0, 3).map(s => s.skillName).join(', ');
        return `Industry benchmarks show ${topSkills} are in high demand with 18% year-over-year growth. These skills command 15-25% salary premium in current market.`;
    }
    async generateLearningRecommendations(context) {
        // Generate personalized learning recommendations based on profile
        const recommendations = [
            'Advanced Data Analytics & Machine Learning Certification',
            'Executive Leadership Development Program',
            'Cloud Architecture Professional Certification (AWS/Azure)',
            'Strategic Business Analysis Course',
            'Digital Transformation Leadership Workshop'
        ];
        return recommendations.slice(0, 3); // Return top 3
    }
    async analyzeCompetitiveLandscape(similarPersons) {
        // Analyze competitive positioning
        const avgSimilarity = similarPersons.reduce((sum, p) => sum + p.similarity, 0) / similarPersons.length;
        return `Competitive analysis: ${avgSimilarity.toFixed(1)}% average similarity to market peers. Strong differentiation opportunities in emerging skill areas.`;
    }
    buildCandidateProfileSummary(context) {
        // Handle plain text data
        if (context.parseMethod === 'plain_text') {
            return `
Data Source: Plain Text Input
Content: ${context.rawData || context.skillText || 'No data provided'}
Analysis Type: Free-form text analysis
            `;
        }
        // Handle both flat and nested context structures (JSON data)
        const firstName = context.personalInfo?.firstName || context.firstName || 'Unknown';
        const lastName = context.personalInfo?.lastName || context.lastName || '';
        const position = context.employmentDetails?.position || 'Not specified';
        const workHistoryLength = context.workHistory?.length || 0;
        const education = context.education?.[0]?.degree || 'Not specified';
        const skills = context.skills?.slice(0, 5).map((s) => s.skillName).join(', ') || 'None';
        const technologies = context.technologies?.slice(0, 5).map((t) => t.technologyName).join(', ') || 'None';
        return `
Name: ${firstName} ${lastName}
Position: ${position}
Experience: ${workHistoryLength} roles
Education: ${education}
Key Skills: ${skills}
Technologies: ${technologies}
        `;
    }
    setupHttpRoutes() {
        this.app.use(express_1.default.json());
        /**
         * Enhanced health check with capability reporting
         */
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'enhanced-hr-mcp-server',
                version: '2.0.0-enhanced',
                capabilities: [
                    'advanced_analysis',
                    'executive_reports',
                    'market_intelligence',
                    'skill_benchmarking',
                    'compensation_analysis',
                    'multi_step_generation'
                ],
                ai_models: ['gpt-4', 'gpt-3.5-turbo-1106'],
                timestamp: new Date().toISOString()
            });
        });
        /**
         * Enhanced tools listing with capabilities and endpoints
         */
        this.app.get('/tools', async (req, res) => {
            try {
                const tools = this.getAvailableTools();
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                const toolEndpoints = [
                    {
                        name: 'analyze_data',
                        endpoint: `${baseUrl}/tools/analyze-data`,
                        method: 'POST',
                        description: 'Advanced AI-powered talent analysis with contextual intelligence'
                    },
                    {
                        name: 'generate_report',
                        endpoint: `${baseUrl}/tools/generate-report`,
                        method: 'POST',
                        description: 'Generate executive-level comprehensive reports with strategic insights'
                    },
                    {
                        name: 'skill_benchmarking',
                        endpoint: `${baseUrl}/tools/skill-benchmarking`,
                        method: 'POST',
                        description: 'Advanced skill benchmarking against industry standards'
                    },
                    {
                        name: 'compensation_analysis',
                        endpoint: `${baseUrl}/tools/compensation-analysis`,
                        method: 'POST',
                        description: 'Comprehensive compensation analysis with market rates'
                    }
                ];
                res.json({
                    tools,
                    toolEndpoints,
                    totalTools: tools.length,
                    capabilities: ['AI-powered analysis', 'Executive reporting', 'Market benchmarking'],
                    genericEndpoint: `${baseUrl}/tools/:toolName`,
                    version: '2.0.0-enhanced'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                res.status(500).json({ error: errorMessage });
            }
        });
        /**
         * @swagger
         * /tools/analyze-data:
         *   post:
         *     summary: Advanced AI-powered talent analysis
         *     description: Perform comprehensive talent analysis with contextual intelligence and strategic recommendations
         *     tags:
         *       - Analysis Tools
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - data
         *             properties:
         *               data:
         *                 type: string
         *                 description: JSON string containing person data and context
         *                 example: '{"personalInfo":{"firstName":"John","lastName":"Doe","email":"john.doe@example.com"},"employmentDetails":{"position":"Senior Software Engineer","department":"Engineering"},"skills":[{"skillName":"JavaScript","skillCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"5","certificationName":"JavaScript Professional","isCertified":true,"lastUsed":"2024-01-15T00:00:00Z"}],"technologies":[{"technologyName":"React","technologyCategory":"Frontend","proficiencyLevel":"Advanced","yearsOfExperience":"4","lastUsed":"2024-01-10T00:00:00Z"}],"education":[{"institution":"MIT","degree":"Bachelor of Science","fieldOfStudy":"Computer Science","graduationDate":"2018-05-15T00:00:00Z","gpa":"3.8"}],"capabilitiesSummary":{"skillsCount":12,"technologiesCount":8,"educationCount":1}}'
         *               analysisType:
         *                 type: string
         *                 enum: [capability_analysis, skill_gap, career_recommendation, performance_optimization, succession_planning, diversity_analytics, compensation_equity, hipo_identification, culture_fit, retention_risk, team_dynamics]
         *                 default: capability_analysis
         *                 example: capability_analysis
         *               userRole:
         *                 type: string
         *                 enum: [hr_manager, employee, executive, recruiter, team_lead]
         *                 default: hr_manager
         *                 example: hr_manager
         *               urgency:
         *                 type: string
         *                 enum: [immediate, standard, strategic]
         *                 default: standard
         *                 example: standard
         *               confidentialityLevel:
         *                 type: string
         *                 enum: [public, internal, confidential, restricted]
         *                 default: internal
         *                 example: internal
         *           example:
         *             data: '{"personalInfo":{"firstName":"John","lastName":"Doe","email":"john.doe@example.com"},"employmentDetails":{"position":"Senior Software Engineer","department":"Engineering"},"skills":[{"skillName":"JavaScript","skillCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"5","certificationName":"JavaScript Professional","isCertified":true,"lastUsed":"2024-01-15T00:00:00Z"},{"skillName":"Python","skillCategory":"Programming","proficiencyLevel":"Advanced","yearsOfExperience":"3","isCertified":false}],"technologies":[{"technologyName":"React","technologyCategory":"Frontend","proficiencyLevel":"Advanced","yearsOfExperience":"4","lastUsed":"2024-01-10T00:00:00Z"},{"technologyName":"Node.js","technologyCategory":"Backend","proficiencyLevel":"Intermediate","yearsOfExperience":"2"}],"education":[{"institution":"MIT","degree":"Bachelor of Science","fieldOfStudy":"Computer Science","graduationDate":"2018-05-15T00:00:00Z","gpa":"3.8"}],"capabilitiesSummary":{"skillsCount":12,"technologiesCount":8,"educationCount":1,"topSkillCategories":["Programming","Database","Cloud"],"topTechnologyCategories":["Frontend","Backend","DevOps"]}}'
         *             analysisType: capability_analysis
         *             userRole: hr_manager
         *             urgency: standard
         *             confidentialityLevel: internal
         *     responses:
         *       200:
         *         description: Analysis completed successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 content:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       type:
         *                         type: string
         *                         example: text
         *                       text:
         *                         type: string
         *                         example: "## CAPABILITY ANALYSIS REPORT\n\n### Executive Summary\nJohn Doe demonstrates strong technical capabilities with 5+ years of experience in modern web development technologies. His expertise in JavaScript and React positions him well for senior engineering roles.\n\n### Key Strengths\n- **Technical Proficiency**: Expert-level JavaScript skills with professional certification\n- **Modern Stack Experience**: Strong React and Node.js capabilities\n- **Educational Foundation**: Computer Science degree from prestigious institution\n\n### Development Opportunities\n- **Cloud Technologies**: Consider AWS/Azure certifications to enhance market value\n- **Leadership Skills**: Technical leadership training for career advancement\n- **Emerging Technologies**: AI/ML skills increasingly valuable in current market\n\n### Strategic Recommendations\n1. **Immediate (0-6 months)**: Complete cloud architecture certification\n2. **Medium-term (6-12 months)**: Take on technical leadership responsibilities\n3. **Long-term (1-2 years)**: Develop full-stack architecture expertise\n\n### Market Positioning\n- **Salary Range**: $95K-$130K based on current skill set\n- **Demand Level**: High - JavaScript/React developers in strong demand\n- **Growth Potential**: 15-20% salary increase possible with recommended certifications"
         *                 metadata:
         *                   type: object
         *                   properties:
         *                     analysisType:
         *                       type: string
         *                       example: capability_analysis
         *                     userRole:
         *                       type: string
         *                       example: hr_manager
         *                     confidence:
         *                       type: number
         *                       example: 85
         *                     processingTime:
         *                       type: string
         *                       example: "2340ms"
         *                     tokenUsage:
         *                       type: number
         *                       example: 1250
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T10:30:00Z"
         *                 requestInfo:
         *                   type: object
         *                   properties:
         *                     toolName:
         *                       type: string
         *                       example: analyze_data
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T10:30:00Z"
         *                     version:
         *                       type: string
         *                       example: "2.0.0-enhanced"
         *       400:
         *         description: Invalid request parameters
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Data must be a JSON string"
         *       500:
         *         description: Analysis failed
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Enhanced AI analysis failed: OpenAI API error"
         *                 toolName:
         *                   type: string
         *                   example: analyze_data
         *                 timestamp:
         *                   type: string
         *                   example: "2024-01-15T10:30:00Z"
         */
        this.app.post('/tools/analyze-data', async (req, res) => {
            try {
                const { data, analysisType, userRole, urgency, confidentialityLevel } = req.body;
                if (typeof data !== 'string') {
                    return res.status(400).json({ error: 'Data must be a JSON string' });
                }
                const result = await this.enhancedAnalyzeData(data, analysisType || 'capability_analysis', userRole || 'hr_manager', urgency || 'standard', confidentialityLevel || 'internal');
                res.json({
                    ...result,
                    requestInfo: {
                        toolName: 'analyze_data',
                        timestamp: new Date().toISOString(),
                        version: '2.0.0-enhanced'
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Analyze data tool error:', error);
                res.status(500).json({
                    error: errorMessage,
                    toolName: 'analyze_data',
                    timestamp: new Date().toISOString()
                });
            }
        });
        /**
         * @swagger
         * /tools/generate-report:
         *   post:
         *     summary: Generate executive-level comprehensive reports
         *     description: Create detailed talent reports with strategic insights and actionable roadmaps
         *     tags:
         *       - Reporting Tools
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - data
         *             properties:
         *               data:
         *                 type: string
         *                 description: JSON string containing person profile and context
         *                 example: '{"personalInfo":{"firstName":"Sarah","lastName":"Johnson","email":"sarah.johnson@example.com","phone":"+1-555-0123","city":"San Francisco","country":"USA"},"employmentDetails":{"position":"Product Manager","department":"Product","startDate":"2022-03-15T00:00:00Z"},"skills":[{"skillName":"Product Strategy","skillCategory":"Management","proficiencyLevel":"Expert","yearsOfExperience":"6"},{"skillName":"Data Analysis","skillCategory":"Analytics","proficiencyLevel":"Advanced","yearsOfExperience":"4"}],"technologies":[{"technologyName":"Jira","technologyCategory":"Project Management","proficiencyLevel":"Expert","yearsOfExperience":"5"},{"technologyName":"Tableau","technologyCategory":"Analytics","proficiencyLevel":"Advanced","yearsOfExperience":"3"}],"education":[{"institution":"Stanford University","degree":"MBA","fieldOfStudy":"Business Administration","graduationDate":"2018-06-15T00:00:00Z","gpa":"3.9"}],"capabilitiesSummary":{"skillsCount":8,"technologiesCount":6,"educationCount":2}}'
         *               reportType:
         *                 type: string
         *                 enum: [comprehensive, executive_brief, development_plan, market_analysis, succession_planning, diversity_impact, compensation_review]
         *                 default: comprehensive
         *                 example: executive_brief
         *               userRole:
         *                 type: string
         *                 enum: [hr_manager, employee, executive, board, team_lead]
         *                 default: hr_manager
         *                 example: executive
         *               includeMetrics:
         *                 type: boolean
         *                 default: true
         *                 example: true
         *               confidentialityLevel:
         *                 type: string
         *                 enum: [public, internal, confidential, restricted]
         *                 default: internal
         *                 example: confidential
         *           example:
         *             data: '{"personalInfo":{"firstName":"Sarah","lastName":"Johnson","email":"sarah.johnson@example.com","phone":"+1-555-0123","city":"San Francisco","country":"USA"},"employmentDetails":{"position":"Product Manager","department":"Product","startDate":"2022-03-15T00:00:00Z","employmentType":"Full-time"},"skills":[{"skillName":"Product Strategy","skillCategory":"Management","proficiencyLevel":"Expert","yearsOfExperience":"6","certificationName":"Certified Product Manager","isCertified":true},{"skillName":"Data Analysis","skillCategory":"Analytics","proficiencyLevel":"Advanced","yearsOfExperience":"4"},{"skillName":"User Research","skillCategory":"Research","proficiencyLevel":"Advanced","yearsOfExperience":"5"}],"technologies":[{"technologyName":"Jira","technologyCategory":"Project Management","proficiencyLevel":"Expert","yearsOfExperience":"5"},{"technologyName":"Tableau","technologyCategory":"Analytics","proficiencyLevel":"Advanced","yearsOfExperience":"3"},{"technologyName":"Figma","technologyCategory":"Design","proficiencyLevel":"Intermediate","yearsOfExperience":"2"}],"education":[{"institution":"Stanford University","degree":"MBA","fieldOfStudy":"Business Administration","graduationDate":"2018-06-15T00:00:00Z","gpa":"3.9"},{"institution":"UC Berkeley","degree":"Bachelor of Science","fieldOfStudy":"Computer Science","graduationDate":"2016-05-15T00:00:00Z","gpa":"3.7"}],"capabilitiesSummary":{"skillsCount":8,"technologiesCount":6,"educationCount":2,"topSkillCategories":["Management","Analytics","Research"],"topTechnologyCategories":["Project Management","Analytics","Design"]}}'
         *             reportType: executive_brief
         *             userRole: executive
         *             includeMetrics: true
         *             confidentialityLevel: confidential
         *     responses:
         *       200:
         *         description: Report generated successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 content:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       type:
         *                         type: string
         *                         example: text
         *                       text:
         *                         type: string
         *                         example: "# EXECUTIVE TALENT BRIEF\n## Sarah Johnson - Product Manager\n\n### EXECUTIVE SUMMARY\nSarah Johnson is a high-performing Product Manager with 6+ years of strategic product leadership experience. Her combination of technical background (CS degree) and business acumen (Stanford MBA) positions her as a valuable strategic asset for product-driven organizations.\n\n### KEY PERFORMANCE INDICATORS\n- **Experience Level**: Senior (6+ years in product management)\n- **Education Quality**: Top-tier (Stanford MBA, UC Berkeley CS)\n- **Skill Diversity**: 8 core competencies across management and analytics\n- **Certification Status**: Certified Product Manager\n- **Market Value**: $140K-$180K (San Francisco market)\n\n### STRATEGIC CAPABILITIES\n- **Product Strategy**: Expert-level strategic thinking and execution\n- **Data-Driven Decision Making**: Advanced analytics capabilities\n- **Cross-Functional Leadership**: Proven ability to lead diverse teams\n- **Technical Fluency**: Strong technical foundation enables effective engineering collaboration\n\n### SUCCESSION PLANNING POTENTIAL\n- **Readiness for VP Product**: 85% ready with 12-18 months development\n- **Key Development Areas**: P&L ownership, board presentation skills\n- **Retention Risk**: Medium (high market demand for profile)\n\n### RECOMMENDED ACTIONS\n1. **Immediate**: Assign P&L responsibility for product line\n2. **6 months**: Executive leadership program enrollment\n3. **12 months**: Board presentation opportunities\n4. **18 months**: VP Product succession planning discussion"
         *                 metadata:
         *                   type: object
         *                   properties:
         *                     reportType:
         *                       type: string
         *                       example: executive_brief
         *                     userRole:
         *                       type: string
         *                       example: executive
         *                     wordCount:
         *                       type: number
         *                       example: 245
         *                     estimatedReadTime:
         *                       type: string
         *                       example: "2 minutes"
         *                     processingTime:
         *                       type: string
         *                       example: "3120ms"
         *                     tokenUsage:
         *                       type: number
         *                       example: 1680
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T11:45:00Z"
         *                 requestInfo:
         *                   type: object
         *                   properties:
         *                     toolName:
         *                       type: string
         *                       example: generate_report
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T11:45:00Z"
         *                     version:
         *                       type: string
         *                       example: "2.0.0-enhanced"
         *       400:
         *         description: Invalid request parameters
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Data must be a JSON string"
         *       500:
         *         description: Report generation failed
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Enhanced AI report generation failed: Model timeout"
         *                 toolName:
         *                   type: string
         *                   example: generate_report
         *                 timestamp:
         *                   type: string
         *                   example: "2024-01-15T11:45:00Z"
         */
        this.app.post('/tools/generate-report', async (req, res) => {
            try {
                const { data, reportType, userRole, includeMetrics, confidentialityLevel } = req.body;
                if (typeof data !== 'string') {
                    return res.status(400).json({ error: 'Data must be a JSON string' });
                }
                const result = await this.enhancedGenerateReport(data, reportType || 'comprehensive', userRole || 'hr_manager', includeMetrics !== false, confidentialityLevel || 'internal');
                res.json({
                    ...result,
                    requestInfo: {
                        toolName: 'generate_report',
                        timestamp: new Date().toISOString(),
                        version: '2.0.0-enhanced'
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Generate report tool error:', error);
                res.status(500).json({
                    error: errorMessage,
                    toolName: 'generate_report',
                    timestamp: new Date().toISOString()
                });
            }
        });
        /**
         * @swagger
         * /tools/skill-benchmarking:
         *   post:
         *     summary: Advanced skill benchmarking analysis
         *     description: Benchmark skills against industry standards with market intelligence
         *     tags:
         *       - Analysis Tools
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - data
         *             properties:
         *               data:
         *                 type: string
         *                 description: JSON string with person skills and experience
         *                 example: '{"personalInfo":{"firstName":"Alex","lastName":"Chen"},"skills":[{"skillName":"Machine Learning","skillCategory":"AI/ML","proficiencyLevel":"Advanced","yearsOfExperience":"4"},{"skillName":"Python","skillCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"6"},{"skillName":"TensorFlow","skillCategory":"AI/ML","proficiencyLevel":"Intermediate","yearsOfExperience":"2"}],"technologies":[{"technologyName":"AWS","technologyCategory":"Cloud","proficiencyLevel":"Advanced","yearsOfExperience":"3"},{"technologyName":"Docker","technologyCategory":"DevOps","proficiencyLevel":"Intermediate","yearsOfExperience":"2"}],"education":[{"institution":"MIT","degree":"Master of Science","fieldOfStudy":"Computer Science","graduationDate":"2020-06-15T00:00:00Z"}],"employmentDetails":{"position":"ML Engineer","department":"Data Science"}}'
         *               industry:
         *                 type: string
         *                 description: Target industry for benchmarking
         *                 example: technology
         *               region:
         *                 type: string
         *                 description: Geographic region for market comparison
         *                 example: north_america
         *               includeProjections:
         *                 type: boolean
         *                 default: true
         *                 description: Include future skill demand projections
         *                 example: true
         *           example:
         *             data: '{"personalInfo":{"firstName":"Alex","lastName":"Chen"},"skills":[{"skillName":"Machine Learning","skillCategory":"AI/ML","proficiencyLevel":"Advanced","yearsOfExperience":"4","certificationName":"AWS ML Specialty","isCertified":true},{"skillName":"Python","skillCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"6"},{"skillName":"Deep Learning","skillCategory":"AI/ML","proficiencyLevel":"Intermediate","yearsOfExperience":"3"},{"skillName":"Data Visualization","skillCategory":"Analytics","proficiencyLevel":"Advanced","yearsOfExperience":"4"}],"technologies":[{"technologyName":"TensorFlow","technologyCategory":"AI/ML","proficiencyLevel":"Advanced","yearsOfExperience":"3"},{"technologyName":"AWS","technologyCategory":"Cloud","proficiencyLevel":"Advanced","yearsOfExperience":"3"},{"technologyName":"Docker","technologyCategory":"DevOps","proficiencyLevel":"Intermediate","yearsOfExperience":"2"},{"technologyName":"Kubernetes","technologyCategory":"DevOps","proficiencyLevel":"Beginner","yearsOfExperience":"1"}],"education":[{"institution":"MIT","degree":"Master of Science","fieldOfStudy":"Computer Science","graduationDate":"2020-06-15T00:00:00Z","gpa":"3.8"}],"employmentDetails":{"position":"ML Engineer","department":"Data Science"},"benchmarkingContext":{"industry":"technology","region":"north_america","requestedAt":"2024-01-15T12:00:00Z"}}'
         *             industry: technology
         *             region: north_america
         *             includeProjections: true
         *     responses:
         *       200:
         *         description: Skill benchmarking completed successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 content:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       type:
         *                         type: string
         *                         example: text
         *                       text:
         *                         type: string
         *                         example: "# SKILL BENCHMARKING ANALYSIS\n## Alex Chen - ML Engineer\n\n### INDUSTRY BENCHMARK RESULTS (Technology Sector, North America)\n\n### SKILL COMPETITIVENESS ANALYSIS\n\n**🏆 TOP-TIER SKILLS (9-10/10)**\n- **Python Programming**: 10/10 - Expert level with 6 years experience exceeds industry median of 4 years\n- **Machine Learning**: 9/10 - Advanced proficiency with AWS certification places in top 15% of practitioners\n\n**📊 COMPETITIVE SKILLS (7-8/10)**\n- **AWS Cloud Platform**: 8/10 - Advanced level aligns with industry demand, 3 years experience solid\n- **Data Visualization**: 7/10 - Advanced proficiency meets market expectations for ML roles\n\n**🚀 DEVELOPING SKILLS (4-6/10)**\n- **Deep Learning**: 6/10 - Intermediate level, opportunity for advancement\n- **Kubernetes**: 4/10 - Beginner level, high growth potential\n\n### MARKET POSITIONING ASSESSMENT\n- **Overall Competitiveness**: 85th percentile among ML Engineers\n- **Salary Positioning**: $130K-$160K range (above median of $125K)\n- **Unique Differentiators**: AWS ML certification, strong Python foundation\n- **Market Scarcity Score**: High - ML + Cloud combination in demand\n\n### GROWTH TRAJECTORY PROJECTIONS (2024-2027)\n\n**📈 EMERGING HIGH-VALUE SKILLS**\n1. **MLOps & Model Deployment** - 45% demand increase projected\n2. **Large Language Models (LLMs)** - 60% demand increase projected\n3. **Edge AI/Mobile ML** - 35% demand increase projected\n\n**💰 ECONOMIC IMPACT ANALYSIS**\n- **Current Skill Portfolio Value**: $155K median compensation\n- **With Recommended Upskilling**: $185K potential (+19% increase)\n- **ROI of MLOps Certification**: $15K salary increase (6-month payback)\n\n### STRATEGIC RECOMMENDATIONS\n1. **Immediate (0-6 months)**: Complete MLOps certification (Kubeflow/MLflow)\n2. **Medium-term (6-12 months)**: Deep dive into LLM fine-tuning and deployment\n3. **Long-term (12-24 months)**: Develop expertise in edge AI and mobile deployment"
         *                 metadata:
         *                   type: object
         *                   properties:
         *                     analysisType:
         *                       type: string
         *                       example: skill_benchmarking
         *                     industry:
         *                       type: string
         *                       example: technology
         *                     region:
         *                       type: string
         *                       example: north_america
         *                     includeProjections:
         *                       type: boolean
         *                       example: true
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T12:00:00Z"
         *                     tokenUsage:
         *                       type: number
         *                       example: 1420
         *                 requestInfo:
         *                   type: object
         *                   properties:
         *                     toolName:
         *                       type: string
         *                       example: skill_benchmarking
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T12:00:00Z"
         *                     version:
         *                       type: string
         *                       example: "2.0.0-enhanced"
         *       400:
         *         description: Invalid request parameters
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Data must be a JSON string"
         *       500:
         *         description: Benchmarking analysis failed
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Skill benchmarking failed: Industry data unavailable"
         *                 toolName:
         *                   type: string
         *                   example: skill_benchmarking
         *                 timestamp:
         *                   type: string
         *                   example: "2024-01-15T12:00:00Z"
         */
        this.app.post('/tools/skill-benchmarking', async (req, res) => {
            try {
                const { data, industry, region, includeProjections } = req.body;
                if (typeof data !== 'string') {
                    return res.status(400).json({ error: 'Data must be a JSON string' });
                }
                const result = await this.skillBenchmarking(data, industry, region, includeProjections !== false);
                res.json({
                    ...result,
                    requestInfo: {
                        toolName: 'skill_benchmarking',
                        timestamp: new Date().toISOString(),
                        version: '2.0.0-enhanced'
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Skill benchmarking tool error:', error);
                res.status(500).json({
                    error: errorMessage,
                    toolName: 'skill_benchmarking',
                    timestamp: new Date().toISOString()
                });
            }
        });
        /**
         * @swagger
         * /tools/compensation-analysis:
         *   post:
         *     summary: Comprehensive compensation analysis
         *     description: Analyze compensation with market rates and equity assessment
         *     tags:
         *       - Analysis Tools
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - data
         *             properties:
         *               data:
         *                 type: string
         *                 description: JSON string with role, skills, and location data
         *                 example: '{"personalInfo":{"firstName":"Maria","lastName":"Rodriguez"},"employmentDetails":{"position":"Senior Data Scientist","department":"Analytics","location":"Austin, Texas"},"skills":[{"skillName":"Machine Learning","skillCategory":"AI/ML","proficiencyLevel":"Expert","yearsOfExperience":"5"},{"skillName":"Statistical Analysis","skillCategory":"Analytics","proficiencyLevel":"Advanced","yearsOfExperience":"6"}],"technologies":[{"technologyName":"Python","technologyCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"6"},{"technologyName":"R","technologyCategory":"Programming","proficiencyLevel":"Advanced","yearsOfExperience":"4"}],"education":[{"institution":"University of Texas","degree":"PhD","fieldOfStudy":"Statistics","graduationDate":"2018-05-15T00:00:00Z"}],"experience":{"totalYears":6,"skillsExperience":[{"skill":"Machine Learning","years":5},{"skill":"Statistical Analysis","years":6}]}}'
         *               marketScope:
         *                 type: string
         *                 enum: [local, national, global]
         *                 default: national
         *                 example: national
         *               includeEquityAnalysis:
         *                 type: boolean
         *                 default: true
         *                 description: Include internal equity and bias analysis
         *                 example: true
         *           example:
         *             data: '{"personalInfo":{"firstName":"Maria","lastName":"Rodriguez"},"employmentDetails":{"position":"Senior Data Scientist","department":"Analytics","location":"Austin, Texas"},"skills":[{"skillName":"Machine Learning","skillCategory":"AI/ML","proficiencyLevel":"Expert","yearsOfExperience":"5","certificationName":"Google ML Professional","isCertified":true},{"skillName":"Statistical Analysis","skillCategory":"Analytics","proficiencyLevel":"Expert","yearsOfExperience":"6"},{"skillName":"Deep Learning","skillCategory":"AI/ML","proficiencyLevel":"Advanced","yearsOfExperience":"3"},{"skillName":"Data Engineering","skillCategory":"Engineering","proficiencyLevel":"Advanced","yearsOfExperience":"4"}],"technologies":[{"technologyName":"Python","technologyCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"6"},{"technologyName":"R","technologyCategory":"Programming","proficiencyLevel":"Advanced","yearsOfExperience":"4"},{"technologyName":"TensorFlow","technologyCategory":"AI/ML","proficiencyLevel":"Advanced","yearsOfExperience":"3"},{"technologyName":"AWS","technologyCategory":"Cloud","proficiencyLevel":"Intermediate","yearsOfExperience":"2"}],"education":[{"institution":"University of Texas at Austin","degree":"PhD","fieldOfStudy":"Statistics","graduationDate":"2018-05-15T00:00:00Z","gpa":"3.9"},{"institution":"Rice University","degree":"Master of Science","fieldOfStudy":"Mathematics","graduationDate":"2015-05-15T00:00:00Z","gpa":"3.8"}],"experience":{"totalYears":6,"skillsExperience":[{"skill":"Machine Learning","years":5},{"skill":"Statistical Analysis","years":6},{"skill":"Deep Learning","years":3},{"skill":"Data Engineering","years":4}]},"analysisContext":{"marketScope":"national","requestedAt":"2024-01-15T13:30:00Z"}}'
         *             marketScope: national
         *             includeEquityAnalysis: true
         *     responses:
         *       200:
         *         description: Compensation analysis completed successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 content:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       type:
         *                         type: string
         *                         example: text
         *                       text:
         *                         type: string
         *                         example: "# COMPREHENSIVE COMPENSATION ANALYSIS\n## Maria Rodriguez - Senior Data Scientist\n\n### MARKET RATE ANALYSIS (National Scope)\n\n**📊 SALARY BENCHMARKING RESULTS**\n- **25th Percentile**: $115,000\n- **50th Percentile (Median)**: $135,000\n- **75th Percentile**: $155,000\n- **90th Percentile**: $175,000\n- **Recommended Range**: $140,000 - $165,000\n\n**💰 TOTAL COMPENSATION BREAKDOWN**\n- **Base Salary**: $140K - $165K\n- **Annual Bonus**: 10-20% of base ($14K - $33K)\n- **Equity/Stock Options**: $15K - $25K annually\n- **Benefits Value**: $25K - $35K (health, retirement, PTO)\n- **Total Package**: $194K - $258K\n\n### MARKET POSITIONING ASSESSMENT\n- **Experience Premium**: +15% above median (6 years experience vs 4-year median)\n- **Education Premium**: +12% for PhD in Statistics\n- **Certification Premium**: +8% for Google ML Professional certification\n- **Location Adjustment**: Austin market ~5% below national average\n- **Skills Scarcity Bonus**: +10% for ML + Statistics combination\n\n### PAY EQUITY ANALYSIS\n- **Gender Pay Gap Check**: Analysis shows 3% gap in similar roles (industry average: 7%)\n- **Experience Adjustment**: Compensation aligns with experience level\n- **Performance Correlation**: Strong correlation between skills and compensation\n- **Internal Equity Score**: 92/100 (excellent)\n\n### NEGOTIATION STRATEGY\n- **Primary Value Proposition**: PhD + 6 years experience + ML certification\n- **Market Leverage**: High demand for ML expertise in Austin tech scene\n- **Negotiation Range**: $150K - $170K base salary\n- **Alternative Benefits**: Consider remote work, additional PTO, conference budget\n- **Timing Advantage**: Q1 budget cycles favor salary negotiations\n\n### GROWTH PROJECTIONS (2024-2027)\n- **Year 1**: 8-12% increase potential with performance\n- **Year 2**: 15-20% with senior/lead promotion\n- **Year 3**: 25-35% with management transition\n- **Long-term**: Principal Data Scientist track ($200K+ potential)\n\n### RECOMMENDED ACTIONS\n1. **Immediate**: Request market adjustment to $155K base\n2. **6 months**: Negotiate performance-based bonus structure\n3. **12 months**: Explore senior/lead data scientist opportunities\n4. **18 months**: Consider management track or principal IC path"
         *                 metadata:
         *                   type: object
         *                   properties:
         *                     analysisType:
         *                       type: string
         *                       example: compensation_analysis
         *                     marketScope:
         *                       type: string
         *                       example: national
         *                     includeEquityAnalysis:
         *                       type: boolean
         *                       example: true
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T13:30:00Z"
         *                     tokenUsage:
         *                       type: number
         *                       example: 1680
         *                 requestInfo:
         *                   type: object
         *                   properties:
         *                     toolName:
         *                       type: string
         *                       example: compensation_analysis
         *                     timestamp:
         *                       type: string
         *                       example: "2024-01-15T13:30:00Z"
         *                     version:
         *                       type: string
         *                       example: "2.0.0-enhanced"
         *       400:
         *         description: Invalid request parameters
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Data must be a JSON string"
         *       500:
         *         description: Compensation analysis failed
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Compensation analysis failed: Market data service unavailable"
         *                 toolName:
         *                   type: string
         *                   example: compensation_analysis
         *                 timestamp:
         *                   type: string
         *                   example: "2024-01-15T13:30:00Z"
         */
        this.app.post('/tools/compensation-analysis', async (req, res) => {
            try {
                const { data, marketScope, includeEquityAnalysis } = req.body;
                if (typeof data !== 'string') {
                    return res.status(400).json({ error: 'Data must be a JSON string' });
                }
                const result = await this.compensationAnalysis(data, marketScope || 'national', includeEquityAnalysis !== false);
                res.json({
                    ...result,
                    requestInfo: {
                        toolName: 'compensation_analysis',
                        timestamp: new Date().toISOString(),
                        version: '2.0.0-enhanced'
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Compensation analysis tool error:', error);
                res.status(500).json({
                    error: errorMessage,
                    toolName: 'compensation_analysis',
                    timestamp: new Date().toISOString()
                });
            }
        });
        /**
         * @swagger
         * /analytics/confidence:
         *   post:
         *     summary: Get analysis confidence score
         *     description: Calculate confidence score for analysis based on data completeness and quality
         *     tags:
         *       - Analytics
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - data
         *             properties:
         *               data:
         *                 type: string
         *                 description: JSON string containing person data for confidence assessment
         *                 example: '{"personalInfo":{"firstName":"John","lastName":"Doe","email":"john.doe@example.com"},"skills":[{"skillName":"JavaScript","proficiencyLevel":"Expert","yearsOfExperience":"5"}],"technologies":[{"technologyName":"React","proficiencyLevel":"Advanced","yearsOfExperience":"4"}],"education":[{"institution":"MIT","degree":"Bachelor of Science","fieldOfStudy":"Computer Science"}]}'
         *           example:
         *             data: '{"personalInfo":{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","phone":"+1-555-0123","address":"123 Main St","city":"San Francisco","country":"USA"},"skills":[{"skillName":"JavaScript","skillCategory":"Programming","proficiencyLevel":"Expert","yearsOfExperience":"5","certificationName":"JavaScript Professional","isCertified":true},{"skillName":"Python","skillCategory":"Programming","proficiencyLevel":"Advanced","yearsOfExperience":"3"}],"technologies":[{"technologyName":"React","technologyCategory":"Frontend","proficiencyLevel":"Advanced","yearsOfExperience":"4"},{"technologyName":"Node.js","technologyCategory":"Backend","proficiencyLevel":"Intermediate","yearsOfExperience":"2"}],"education":[{"institution":"MIT","degree":"Bachelor of Science","fieldOfStudy":"Computer Science","graduationDate":"2018-05-15T00:00:00Z","gpa":"3.8"}],"workHistory":[{"position":"Senior Software Engineer","company":"Tech Corp","startDate":"2020-01-15T00:00:00Z","endDate":"2024-01-15T00:00:00Z"}]}'
         *     responses:
         *       200:
         *         description: Confidence score calculated successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 confidence:
         *                   type: number
         *                   example: 85
         *                   description: Confidence score from 0-100
         *                 level:
         *                   type: string
         *                   example: High
         *                   enum: [Low, Medium, High]
         *                 recommendations:
         *                   type: array
         *                   items:
         *                     type: string
         *                   example: ["Profile is comprehensive for analysis"]
         *                 timestamp:
         *                   type: string
         *                   example: "2024-01-15T14:00:00Z"
         *       400:
         *         description: Invalid request parameters
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Data must be a JSON string"
         *       500:
         *         description: Confidence calculation failed
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: "Confidence analysis failed: Invalid JSON format"
         */
        this.app.post('/analytics/confidence', async (req, res) => {
            try {
                const { data } = req.body;
                if (typeof data !== 'string') {
                    return res.status(400).json({ error: 'Data must be a JSON string' });
                }
                // Handle both JSON and plain text input
                let context;
                try {
                    context = JSON.parse(data);
                }
                catch (parseError) {
                    // If JSON parsing fails, treat as plain text
                    context = {
                        rawData: data,
                        parseMethod: 'plain_text'
                    };
                }
                const enrichedContext = await this.enrichContext(context);
                const confidence = this.calculateConfidenceScore(enrichedContext);
                res.json({
                    confidence,
                    level: confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low',
                    recommendations: confidence < 70 ? [
                        'Add more work history details',
                        'Include additional skills and certifications',
                        'Provide education background information'
                    ] : ['Profile is comprehensive for analysis'],
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                res.status(500).json({ error: errorMessage });
            }
        });
        // IMPORTANT: Generic route is defined LAST to avoid catching specific routes
        // This route provides legacy support for the old MCP protocol format
        /**
         * Enhanced tool execution with advanced parameter handling (GENERIC - legacy support)
         */
        this.app.post('/tools/:toolName', async (req, res) => {
            try {
                const { toolName } = req.params;
                const { arguments: args } = req.body;
                if (!args || typeof args !== 'object') {
                    return res.status(400).json({
                        error: 'Invalid arguments provided',
                        expected: 'Arguments object with tool-specific parameters'
                    });
                }
                let result;
                switch (toolName) {
                    case 'analyze_data':
                        const { data, analysisType, userRole, urgency, confidentialityLevel } = args;
                        if (typeof data !== 'string') {
                            return res.status(400).json({ error: 'Data must be a JSON string' });
                        }
                        result = await this.enhancedAnalyzeData(data, analysisType, userRole, urgency, confidentialityLevel);
                        break;
                    case 'generate_report':
                        const { data: reportData, reportType, userRole: reportUserRole, includeMetrics, confidentialityLevel: reportConfidentiality } = args;
                        if (typeof reportData !== 'string') {
                            return res.status(400).json({ error: 'Data must be a JSON string' });
                        }
                        result = await this.enhancedGenerateReport(reportData, reportType, reportUserRole, includeMetrics, reportConfidentiality);
                        break;
                    case 'skill_benchmarking':
                        const { data: skillData, industry, region, includeProjections } = args;
                        if (typeof skillData !== 'string') {
                            return res.status(400).json({ error: 'Data must be a JSON string' });
                        }
                        result = await this.skillBenchmarking(skillData, industry, region, includeProjections);
                        break;
                    case 'compensation_analysis':
                        const { data: compData, marketScope, includeEquityAnalysis } = args;
                        if (typeof compData !== 'string') {
                            return res.status(400).json({ error: 'Data must be a JSON string' });
                        }
                        result = await this.compensationAnalysis(compData, marketScope, includeEquityAnalysis);
                        break;
                    default:
                        return res.status(404).json({
                            error: `Unknown tool: ${toolName}`,
                            availableTools: this.getAvailableTools().map(t => t.name)
                        });
                }
                res.json({
                    ...result,
                    requestInfo: {
                        toolName,
                        timestamp: new Date().toISOString(),
                        version: '2.0.0-enhanced'
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error(`Tool execution error for ${req.params.toolName}:`, error);
                res.status(500).json({
                    error: errorMessage,
                    toolName: req.params.toolName,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    async start(port = 3002) {
        return new Promise((resolve) => {
            this.app.listen(port, () => {
                console.log(`🚀 Enhanced HR MCP Server v2.0 running on port ${port}`);
                console.log(`📊 Advanced AI Analytics: ACTIVE`);
                console.log(`🎯 Executive Reporting: ENABLED`);
                console.log(`📈 Market Intelligence: CONNECTED`);
                console.log(`📖 Swagger UI: http://localhost:${port}/api-docs`);
                console.log(`✨ Enhanced prompts and contextual AI ready!`);
                resolve();
            });
        });
    }
    async startStdio() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.mcpServer.connect(transport);
    }
}
exports.HttpMcpServer = HttpMcpServer;
// Start the enhanced server
const server = new HttpMcpServer();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
server.start(port);
