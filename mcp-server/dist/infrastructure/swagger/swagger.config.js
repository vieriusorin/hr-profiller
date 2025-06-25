"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Enhanced HR MCP Server API',
            version: '2.0.0',
            description: `
      # Advanced HR Analytics & Talent Intelligence Platform

      A sophisticated API powered by advanced AI for comprehensive talent analysis, executive reporting, and strategic workforce planning.
      `
        },
        servers: [
            {
                url: 'http://localhost:3002',
                description: 'Development server with advanced AI capabilities'
            },
            {
                url: 'https://api.company.com',
                description: 'Production server (when deployed)'
            }
        ],
        tags: [
            {
                name: 'Health',
                description: 'System health and capability reporting'
            },
            {
                name: 'Tools',
                description: 'Advanced HR analytics and AI-powered tools'
            },
            {
                name: 'Analytics',
                description: 'Data quality and confidence assessment'
            }
        ],
        components: {
            schemas: {
                AnalysisRequest: {
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string containing person profile and context data',
                            example: '{"firstName": "John", "lastName": "Doe", "skills": [{"skillName": "Python", "proficiencyLevel": 8}]}'
                        },
                        analysisType: {
                            type: 'string',
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
                            ],
                            description: 'Type of advanced analysis to perform',
                            default: 'capability_analysis'
                        },
                        userRole: {
                            type: 'string',
                            enum: ['hr_manager', 'employee', 'executive', 'recruiter', 'team_lead'],
                            description: 'User role for AI persona selection and context',
                            default: 'hr_manager'
                        },
                        urgency: {
                            type: 'string',
                            enum: ['immediate', 'standard', 'strategic'],
                            description: 'Analysis urgency affecting AI model and depth',
                            default: 'standard'
                        },
                        confidentialityLevel: {
                            type: 'string',
                            enum: ['public', 'internal', 'confidential', 'restricted'],
                            description: 'Data confidentiality level for compliance',
                            default: 'internal'
                        }
                    }
                },
                AnalysisResponse: {
                    type: 'object',
                    properties: {
                        analysis: {
                            type: 'string',
                            description: 'Comprehensive AI-generated analysis'
                        },
                        confidence: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Confidence score for the analysis'
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Actionable recommendations'
                        },
                        metadata: {
                            type: 'object',
                            properties: {
                                analysisType: { type: 'string' },
                                userRole: { type: 'string' },
                                urgency: { type: 'string' },
                                confidentialityLevel: { type: 'string' },
                                processingTime: { type: 'number' },
                                modelUsed: { type: 'string' },
                                tokensUsed: { type: 'number' },
                                timestamp: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                },
                HealthStatus: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['healthy', 'unhealthy']
                        },
                        service: {
                            type: 'string',
                            example: 'enhanced-hr-mcp-server'
                        },
                        capabilities: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        version: {
                            type: 'string',
                            example: '2.0.0'
                        }
                    }
                },
                McpTool: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the MCP tool'
                        },
                        description: {
                            type: 'string',
                            description: 'Description of what the tool does'
                        },
                        inputSchema: {
                            type: 'object',
                            description: 'Schema defining the input parameters for the tool'
                        },
                        capabilities: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of capabilities provided by this tool'
                        }
                    }
                },
                ResponseEnvelope: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['success', 'error']
                        },
                        data: {
                            type: 'object',
                            description: 'Response data (varies by endpoint)'
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error']
                        },
                        data: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    description: 'Error message'
                                },
                                code: {
                                    type: 'string',
                                    description: 'Error code'
                                },
                                details: {
                                    type: 'object',
                                    description: 'Additional error details'
                                }
                            }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/**/*.ts'] // Path to the API files
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
