"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptEngineServiceImpl = void 0;
const inversify_1 = require("inversify");
let PromptEngineServiceImpl = class PromptEngineServiceImpl {
    async generateAnalysisPrompt(analysis) {
        const personaContext = analysis.getPersonaContext();
        const analysisTypePrompt = this.getAnalysisTypePrompt(analysis.analysisType);
        const confidentialityNote = this.getConfidentialityNote(analysis.confidentialityLevel);
        return `
# HR Analytics AI Assistant

## Context
You are an advanced HR analytics AI assistant with specialized expertise in talent analysis. You are currently operating as: **${personaContext}**.

## Analysis Request
**Type**: ${analysis.analysisType}
**Urgency**: ${analysis.urgency}
**Confidentiality**: ${analysis.confidentialityLevel}

${analysisTypePrompt}

## Data to Analyze
\`\`\`
${analysis.content}
\`\`\`

## Instructions
1. Analyze the provided data comprehensively
2. Provide actionable insights relevant to the analysis type
3. Include specific recommendations
4. Maintain appropriate confidentiality level
5. Structure your response clearly with sections

## Response Format
Please structure your response as follows:

### Analysis Summary
[Provide a clear, concise summary of your findings]

### Key Insights
[List 3-5 key insights with specific details]

### Recommendations
[Provide actionable recommendations]

### Confidence Assessment
[Rate your confidence in this analysis from 0.0 to 1.0 and explain why]

${confidentialityNote}

Begin your analysis:
`;
    }
    extractInsights(rawResult) {
        // Extract confidence score
        const confidenceMatch = rawResult.match(/confidence.*?(\d+(?:\.\d+)?)/i);
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
        // Extract recommendations section
        const recommendationsSection = this.extractSection(rawResult, 'recommendations');
        const recommendations = this.parseRecommendations(recommendationsSection);
        // Clean up the analysis (remove the confidence section for cleaner output)
        const analysis = rawResult.replace(/### Confidence Assessment[\s\S]*$/i, '').trim();
        return {
            analysis,
            confidence: Math.min(Math.max(confidence, 0), 1), // Clamp between 0 and 1
            recommendations
        };
    }
    getAnalysisTypePrompt(analysisType) {
        const prompts = {
            capability_analysis: `
### Capability Analysis Focus
Analyze the person's core capabilities, strengths, and potential areas for development. Focus on:
- Technical and soft skills assessment
- Experience depth and breadth
- Leadership and collaboration abilities
- Growth potential and adaptability
`,
            skill_gap: `
### Skill Gap Analysis Focus
Identify gaps between current skills and market demands or role requirements. Focus on:
- Missing critical skills for current/target role
- Market trends and emerging skill requirements
- Prioritized learning recommendations
- Timeline for skill development
`,
            career_recommendation: `
### Career Recommendation Focus
Provide personalized career development guidance. Focus on:
- Career progression opportunities
- Skill development priorities
- Industry trends and opportunities
- Long-term career strategy
`,
            performance_optimization: `
### Performance Optimization Focus
Analyze current performance and identify optimization opportunities. Focus on:
- Performance strengths and improvement areas
- Efficiency and productivity insights
- Goal alignment and achievement strategies
- Resource and support recommendations
`,
            succession_planning: `
### Succession Planning Focus
Evaluate succession readiness and development needs. Focus on:
- Leadership readiness assessment
- Critical role preparation
- Development gap analysis
- Succession timeline and milestones
`
        };
        return prompts[analysisType] || prompts.capability_analysis;
    }
    getConfidentialityNote(level) {
        const notes = {
            public: '**Note**: This analysis is suitable for public sharing.',
            internal: '**Note**: This analysis is for internal use within the organization.',
            confidential: '**Note**: This analysis contains confidential information. Handle with discretion.',
            restricted: '**Note**: This analysis contains highly sensitive information. Restrict access to authorized personnel only.'
        };
        return notes[level] || notes.internal;
    }
    extractSection(text, sectionName) {
        const regex = new RegExp(`###\\s*${sectionName}[\\s\\S]*?(?=###|$)`, 'i');
        const match = text.match(regex);
        return match ? match[0] : '';
    }
    parseRecommendations(recommendationsSection) {
        if (!recommendationsSection)
            return [];
        // Split by lines and extract recommendation items
        const lines = recommendationsSection.split('\n');
        const recommendations = [];
        for (const line of lines) {
            const trimmed = line.trim();
            // Look for numbered lists, bullet points, or dashes
            if (trimmed.match(/^[\d\-\*\•]\s*/) || trimmed.startsWith('- ')) {
                const cleaned = trimmed.replace(/^[\d\-\*\•\s]+/, '').trim();
                if (cleaned.length > 10) { // Only include substantial recommendations
                    recommendations.push(cleaned);
                }
            }
        }
        // If no formatted recommendations found, extract from sentences
        if (recommendations.length === 0) {
            const sentences = recommendationsSection.split(/[.!?]+/);
            for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (trimmed.length > 20 && trimmed.toLowerCase().includes('recommend')) {
                    recommendations.push(trimmed);
                }
            }
        }
        return recommendations.slice(0, 5); // Limit to 5 recommendations
    }
};
exports.PromptEngineServiceImpl = PromptEngineServiceImpl;
exports.PromptEngineServiceImpl = PromptEngineServiceImpl = __decorate([
    (0, inversify_1.injectable)()
], PromptEngineServiceImpl);
