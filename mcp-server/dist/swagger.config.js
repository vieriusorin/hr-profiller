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

## 🚀 Key Features

- **Advanced AI Analysis**: Role-specific AI personas (ARIA, SAGE, TITAN) for contextual insights
- **Executive Reporting**: Multi-step report generation with strategic recommendations
- **Market Intelligence**: Real-time benchmarking and competitive analysis  
- **Skill Analytics**: Comprehensive skill benchmarking with future projections
- **Compensation Intelligence**: Equity analysis and market positioning
- **Confidence Scoring**: Data completeness assessment with improvement recommendations

## 🎯 AI Capabilities

- **Dynamic Model Selection**: Optimizes AI model based on urgency and complexity
- **Context Enrichment**: Automatically enhances data with market intelligence
- **Multi-Step Generation**: Complex reports use staged AI generation for depth
- **Bias Mitigation**: Built-in inclusive language and compliance considerations

## 🔧 Usage Examples

### Basic Analysis
\`\`\`json
POST /tools/analyze_data
{
  "arguments": {
    "data": "{\\"firstName\\": \\"John\\", \\"lastName\\": \\"Doe\\", ...}",
    "analysisType": "capability_analysis",
    "userRole": "hr_manager"
  }
}
\`\`\`

### Executive Report
\`\`\`json
POST /tools/generate_report
{
  "arguments": {
    "data": "{\\"firstName\\": \\"Jane\\", \\"lastName\\": \\"Smith\\", ...}",
    "reportType": "executive_brief",
    "userRole": "executive",
    "includeMetrics": true
  }
}
\`\`\`

### Skill Benchmarking
\`\`\`json
POST /tools/skill_benchmarking
{
  "arguments": {
    "data": "{\\"skills\\": [...], \\"experience\\": [...]}",
    "industry": "technology",
    "region": "north_america"
  }
}
\`\`\`

## 📊 Response Format

All analysis responses include comprehensive metadata:
- Confidence scores and processing metrics
- Token usage and model information
- Timestamp and version tracking
- Quality assessments and recommendations

## 🛡️ Compliance & Ethics

- GDPR and EEOC compliant analysis
- Bias-free language and inclusive practices
- Configurable confidentiality levels
- Legal compliance validation
      `,
            contact: {
                name: 'HR Analytics API Support',
                email: 'support@company.com',
                url: 'https://company.com/support'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
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
                ReportRequest: {
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string containing comprehensive person profile',
                            example: '{"firstName": "Jane", "lastName": "Smith", "employmentDetails": {"position": "Senior Developer"}}'
                        },
                        reportType: {
                            type: 'string',
                            enum: [
                                'comprehensive',
                                'executive_brief',
                                'development_plan',
                                'market_analysis',
                                'succession_planning',
                                'diversity_impact',
                                'compensation_review'
                            ],
                            description: 'Report format and depth',
                            default: 'comprehensive'
                        },
                        userRole: {
                            type: 'string',
                            enum: ['hr_manager', 'employee', 'executive', 'board', 'team_lead'],
                            description: 'Target audience for report customization',
                            default: 'hr_manager'
                        },
                        includeMetrics: {
                            type: 'boolean',
                            description: 'Include detailed metrics and ROI calculations',
                            default: true
                        },
                        confidentialityLevel: {
                            type: 'string',
                            enum: ['public', 'internal', 'confidential', 'restricted'],
                            description: 'Report confidentiality level',
                            default: 'internal'
                        }
                    }
                },
                SkillBenchmarkRequest: {
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string with skills and experience data'
                        },
                        industry: {
                            type: 'string',
                            description: 'Target industry for benchmarking',
                            example: 'technology'
                        },
                        region: {
                            type: 'string',
                            description: 'Geographic region for comparison',
                            example: 'north_america'
                        },
                        includeProjections: {
                            type: 'boolean',
                            description: 'Include future skill demand projections',
                            default: true
                        }
                    }
                },
                CompensationRequest: {
                    type: 'object',
                    required: ['data'],
                    properties: {
                        data: {
                            type: 'string',
                            description: 'JSON string with role, skills, and location data'
                        },
                        marketScope: {
                            type: 'string',
                            enum: ['local', 'national', 'global'],
                            description: 'Market scope for analysis',
                            default: 'national'
                        },
                        includeEquityAnalysis: {
                            type: 'boolean',
                            description: 'Include internal equity and bias analysis',
                            default: true
                        }
                    }
                },
                AnalysisResponse: {
                    type: 'object',
                    properties: {
                        content: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: {
                                        type: 'string',
                                        example: 'text'
                                    },
                                    text: {
                                        type: 'string',
                                        description: 'Comprehensive AI-generated analysis with insights and recommendations'
                                    }
                                }
                            }
                        },
                        metadata: {
                            type: 'object',
                            properties: {
                                analysisType: { type: 'string' },
                                userRole: { type: 'string' },
                                urgency: { type: 'string' },
                                confidentialityLevel: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' },
                                confidence: { type: 'number', minimum: 0, maximum: 100 },
                                processingTime: { type: 'string' },
                                model: { type: 'string' },
                                tokenUsage: { type: 'number' },
                                version: { type: 'string' }
                            }
                        },
                        requestInfo: {
                            type: 'object',
                            properties: {
                                toolName: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' },
                                version: { type: 'string' }
                            }
                        }
                    }
                },
                ConfidenceResponse: {
                    type: 'object',
                    properties: {
                        confidence: {
                            type: 'number',
                            minimum: 0,
                            maximum: 100,
                            description: 'Data completeness confidence score'
                        },
                        level: {
                            type: 'string',
                            enum: ['High', 'Medium', 'Low'],
                            description: 'Confidence level assessment'
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Suggestions for improving data quality'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'healthy'
                        },
                        service: {
                            type: 'string',
                            example: 'enhanced-hr-mcp-server'
                        },
                        version: {
                            type: 'string',
                            example: '2.0.0-enhanced'
                        },
                        capabilities: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['advanced_analysis', 'executive_reports', 'market_intelligence']
                        },
                        ai_models: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['gpt-4', 'gpt-3.5-turbo-1106']
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        },
                        toolName: {
                            type: 'string',
                            description: 'Tool that generated the error (if applicable)'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        expected: {
                            type: 'string',
                            description: 'Expected input format (for validation errors)'
                        },
                        availableTools: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of available tools (for unknown tool errors)'
                        }
                    }
                }
            },
            responses: {
                NotFound: {
                    description: 'The specified resource was not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Invalid request parameters or data format',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Internal server error during AI processing',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            }
                        }
                    }
                }
            },
            examples: {
                BasicAnalysis: {
                    summary: 'Basic capability analysis',
                    value: {
                        arguments: {
                            data: '{"firstName": "John", "lastName": "Doe", "skills": [{"skillName": "Python", "proficiencyLevel": 8}, {"skillName": "Machine Learning", "proficiencyLevel": 7}], "employmentDetails": {"position": "Senior Data Scientist"}}',
                            analysisType: 'capability_analysis',
                            userRole: 'hr_manager'
                        }
                    }
                },
                ExecutiveReport: {
                    summary: 'Executive brief report',
                    value: {
                        arguments: {
                            data: '{"firstName": "Jane", "lastName": "Smith", "employmentDetails": {"position": "VP Engineering", "company": "TechCorp"}, "skills": [{"skillName": "Leadership", "proficiencyLevel": 9}]}',
                            reportType: 'executive_brief',
                            userRole: 'executive',
                            includeMetrics: true,
                            confidentialityLevel: 'confidential'
                        }
                    }
                },
                SkillBenchmark: {
                    summary: 'Technology skill benchmarking',
                    value: {
                        arguments: {
                            data: '{"skills": [{"skillName": "React", "proficiencyLevel": 8}, {"skillName": "Node.js", "proficiencyLevel": 7}], "experience": [{"role": "Frontend Developer", "duration": "3 years"}]}',
                            industry: 'technology',
                            region: 'north_america',
                            includeProjections: true
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/server.ts'], // Path to the API docs
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
