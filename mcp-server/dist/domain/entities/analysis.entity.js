"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analysis = exports.ConfidentialityLevel = exports.UrgencyLevel = exports.UserRole = exports.AnalysisType = void 0;
var AnalysisType;
(function (AnalysisType) {
    AnalysisType["CAPABILITY_ANALYSIS"] = "capability_analysis";
    AnalysisType["SKILL_GAP"] = "skill_gap";
    AnalysisType["CAREER_RECOMMENDATION"] = "career_recommendation";
    AnalysisType["PERFORMANCE_OPTIMIZATION"] = "performance_optimization";
    AnalysisType["SUCCESSION_PLANNING"] = "succession_planning";
    AnalysisType["DIVERSITY_ANALYTICS"] = "diversity_analytics";
    AnalysisType["COMPENSATION_EQUITY"] = "compensation_equity";
    AnalysisType["HIPO_IDENTIFICATION"] = "hipo_identification";
    AnalysisType["CULTURE_FIT"] = "culture_fit";
    AnalysisType["RETENTION_RISK"] = "retention_risk";
    AnalysisType["TEAM_DYNAMICS"] = "team_dynamics";
})(AnalysisType || (exports.AnalysisType = AnalysisType = {}));
var UserRole;
(function (UserRole) {
    UserRole["HR_MANAGER"] = "hr_manager";
    UserRole["EMPLOYEE"] = "employee";
    UserRole["EXECUTIVE"] = "executive";
    UserRole["RECRUITER"] = "recruiter";
    UserRole["TEAM_LEAD"] = "team_lead";
})(UserRole || (exports.UserRole = UserRole = {}));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["IMMEDIATE"] = "immediate";
    UrgencyLevel["STANDARD"] = "standard";
    UrgencyLevel["STRATEGIC"] = "strategic";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
var ConfidentialityLevel;
(function (ConfidentialityLevel) {
    ConfidentialityLevel["PUBLIC"] = "public";
    ConfidentialityLevel["INTERNAL"] = "internal";
    ConfidentialityLevel["CONFIDENTIAL"] = "confidential";
    ConfidentialityLevel["RESTRICTED"] = "restricted";
})(ConfidentialityLevel || (exports.ConfidentialityLevel = ConfidentialityLevel = {}));
class Analysis {
    constructor(data) {
        this.id = this.generateId();
        this.content = data.content;
        this.analysisType = data.analysisType;
        this.userRole = data.userRole;
        this.urgency = data.urgency;
        this.confidentialityLevel = data.confidentialityLevel;
        this.metadata = data.metadata || {};
        this.createdAt = new Date();
    }
    // Business methods
    setResult(result, confidence, recommendations = []) {
        if (!result.trim()) {
            throw new Error('Analysis result cannot be empty');
        }
        if (confidence < 0 || confidence > 1) {
            throw new Error('Confidence must be between 0 and 1');
        }
        this._result = result;
        this._confidence = confidence;
        this._recommendations = recommendations;
    }
    setProcessingMetadata(metadata) {
        this._processingMetadata = { ...metadata };
    }
    get result() {
        return this._result;
    }
    get confidence() {
        return this._confidence;
    }
    get recommendations() {
        return this._recommendations || [];
    }
    get processingMetadata() {
        return this._processingMetadata || {};
    }
    get isCompleted() {
        return !!this._result;
    }
    get isHighConfidence() {
        return (this._confidence || 0) >= 0.8;
    }
    get isUrgent() {
        return this.urgency === UrgencyLevel.IMMEDIATE;
    }
    get isHighlyConfidential() {
        return this.confidentialityLevel === ConfidentialityLevel.RESTRICTED ||
            this.confidentialityLevel === ConfidentialityLevel.CONFIDENTIAL;
    }
    // Validation methods
    validateForAnalysis() {
        if (!this.content.trim()) {
            throw new Error('Analysis content cannot be empty');
        }
        if (this.content.length < 10) {
            throw new Error('Analysis content is too short for meaningful analysis');
        }
    }
    // Utility methods
    getPersonaContext() {
        const personas = {
            [UserRole.HR_MANAGER]: 'Strategic HR professional focused on talent optimization',
            [UserRole.EMPLOYEE]: 'Individual contributor seeking professional development',
            [UserRole.EXECUTIVE]: 'Senior leader focused on organizational strategy',
            [UserRole.RECRUITER]: 'Talent acquisition specialist evaluating candidates',
            [UserRole.TEAM_LEAD]: 'Team manager optimizing team performance'
        };
        return personas[this.userRole];
    }
    getOptimalModelConfig() {
        const configs = {
            [UrgencyLevel.IMMEDIATE]: { model: 'gpt-3.5-turbo', temperature: 0.3, maxTokens: 2000 },
            [UrgencyLevel.STANDARD]: { model: 'gpt-4', temperature: 0.5, maxTokens: 4000 },
            [UrgencyLevel.STRATEGIC]: { model: 'gpt-4', temperature: 0.7, maxTokens: 6000 }
        };
        return configs[this.urgency];
    }
    toSummary() {
        return {
            id: this.id,
            analysisType: this.analysisType,
            userRole: this.userRole,
            urgency: this.urgency,
            isCompleted: this.isCompleted,
            confidence: this.confidence,
            createdAt: this.createdAt
        };
    }
    generateId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.Analysis = Analysis;
