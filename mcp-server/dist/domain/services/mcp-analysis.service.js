"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpAnalysisService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../shared/types");
const analysis_entity_1 = require("../entities/analysis.entity");
let McpAnalysisService = class McpAnalysisService {
    constructor(openAIService, promptEngine) {
        this.openAIService = openAIService;
        this.promptEngine = promptEngine;
    }
    async analyzeData(request) {
        // Create analysis entity
        const analysis = new analysis_entity_1.Analysis({
            content: request.data,
            analysisType: this.parseAnalysisType(request.analysisType),
            userRole: this.parseUserRole(request.userRole),
            urgency: this.parseUrgencyLevel(request.urgency),
            confidentialityLevel: this.parseConfidentialityLevel(request.confidentialityLevel),
            metadata: { requestId: this.generateRequestId() }
        });
        // Validate the analysis
        analysis.validateForAnalysis();
        const startTime = Date.now();
        try {
            // Generate AI prompt based on analysis context
            const prompt = await this.promptEngine.generateAnalysisPrompt(analysis);
            // Get optimal model configuration
            const modelConfig = analysis.getOptimalModelConfig();
            // Generate AI completion
            const aiResult = await this.openAIService.generateCompletion(prompt, {
                model: modelConfig.model,
                temperature: modelConfig.temperature,
                maxTokens: modelConfig.maxTokens
            });
            // Extract insights from AI result
            const insights = this.promptEngine.extractInsights(aiResult.content);
            // Set analysis result
            analysis.setResult(insights.analysis, insights.confidence, insights.recommendations);
            // Set processing metadata
            const processingTime = Date.now() - startTime;
            analysis.setProcessingMetadata({
                processingTime,
                modelUsed: aiResult.model,
                tokensUsed: aiResult.tokensUsed,
                timestamp: new Date().toISOString()
            });
            // Return structured response
            return {
                analysis: insights.analysis,
                confidence: insights.confidence,
                recommendations: insights.recommendations,
                metadata: {
                    analysisType: analysis.analysisType,
                    userRole: analysis.userRole,
                    urgency: analysis.urgency,
                    confidentialityLevel: analysis.confidentialityLevel,
                    processingTime,
                    modelUsed: aiResult.model,
                    tokensUsed: aiResult.tokensUsed,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            console.error('Analysis failed:', error);
            throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getAnalysisConfidence(data) {
        try {
            // Create a confidence analysis entity
            const analysis = new analysis_entity_1.Analysis({
                content: data,
                analysisType: analysis_entity_1.AnalysisType.CAPABILITY_ANALYSIS,
                userRole: analysis_entity_1.UserRole.HR_MANAGER,
                urgency: analysis_entity_1.UrgencyLevel.STANDARD,
                confidentialityLevel: analysis_entity_1.ConfidentialityLevel.INTERNAL
            });
            const confidence = await this.calculateConfidenceScore(analysis);
            const level = this.getConfidenceLevel(confidence);
            const recommendations = this.generateConfidenceRecommendations(confidence, analysis);
            return {
                confidence,
                level,
                recommendations,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('Confidence analysis failed:', error);
            throw new Error(`Confidence analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Private helper methods
    parseAnalysisType(type) {
        if (!type)
            return analysis_entity_1.AnalysisType.CAPABILITY_ANALYSIS;
        const analysisType = Object.values(analysis_entity_1.AnalysisType).find(t => t === type);
        return analysisType || analysis_entity_1.AnalysisType.CAPABILITY_ANALYSIS;
    }
    parseUserRole(role) {
        if (!role)
            return analysis_entity_1.UserRole.HR_MANAGER;
        const userRole = Object.values(analysis_entity_1.UserRole).find(r => r === role);
        return userRole || analysis_entity_1.UserRole.HR_MANAGER;
    }
    parseUrgencyLevel(urgency) {
        if (!urgency)
            return analysis_entity_1.UrgencyLevel.STANDARD;
        const urgencyLevel = Object.values(analysis_entity_1.UrgencyLevel).find(u => u === urgency);
        return urgencyLevel || analysis_entity_1.UrgencyLevel.STANDARD;
    }
    parseConfidentialityLevel(level) {
        if (!level)
            return analysis_entity_1.ConfidentialityLevel.INTERNAL;
        const confidentialityLevel = Object.values(analysis_entity_1.ConfidentialityLevel).find(c => c === level);
        return confidentialityLevel || analysis_entity_1.ConfidentialityLevel.INTERNAL;
    }
    async calculateConfidenceScore(analysis) {
        // Basic confidence calculation based on data completeness and structure
        let score = 0.5; // Base score
        // Content length assessment
        if (analysis.content.length > 100)
            score += 0.2;
        if (analysis.content.length > 500)
            score += 0.1;
        // Structure assessment (JSON, specific fields, etc.)
        try {
            const parsed = JSON.parse(analysis.content);
            if (parsed && typeof parsed === 'object') {
                score += 0.1;
                // Check for key fields
                const keyFields = ['skills', 'experience', 'name', 'position'];
                const foundFields = keyFields.filter(field => Object.keys(parsed).some(key => key.toLowerCase().includes(field)));
                score += (foundFields.length / keyFields.length) * 0.1;
            }
        }
        catch {
            // Not JSON, check for structured text
            const hasStructuredData = /\b(skills?|experience|years?|position|role)\b/i.test(analysis.content);
            if (hasStructuredData)
                score += 0.05;
        }
        return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
    }
    getConfidenceLevel(confidence) {
        if (confidence >= 0.8)
            return 'high';
        if (confidence >= 0.6)
            return 'medium';
        return 'low';
    }
    generateConfidenceRecommendations(confidence, analysis) {
        const recommendations = [];
        if (confidence < 0.6) {
            recommendations.push('Provide more structured data for better analysis');
            recommendations.push('Include specific details about skills and experience');
        }
        if (analysis.content.length < 200) {
            recommendations.push('Provide more detailed information for comprehensive analysis');
        }
        try {
            JSON.parse(analysis.content);
        }
        catch {
            recommendations.push('Consider providing data in JSON format for optimal processing');
        }
        if (recommendations.length === 0) {
            recommendations.push('Data quality is good for accurate analysis');
        }
        return recommendations;
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.McpAnalysisService = McpAnalysisService;
exports.McpAnalysisService = McpAnalysisService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.OpenAIService)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.McpPromptEngineService)),
    __metadata("design:paramtypes", [Object, Object])
], McpAnalysisService);
