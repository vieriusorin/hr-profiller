/**
 * Enhanced HR AI Prompt System with Dynamic Context and Advanced Analytics
 * Transforms basic prompts into intelligent, contextual, and actionable insights
 */

export class EnhancedHRPromptEngine {

    /**
     * Advanced system prompt with role-specific intelligence
     */
    getSystemPrompt(userRole: string = 'hr_manager'): string {
        const rolePrompts = {
            hr_manager: `You are ARIA (Advanced Recruitment & Intelligence Advisor), an elite HR strategist with 15+ years of experience in talent analytics, organizational psychology, and workforce optimization. You possess deep expertise in:

- Executive talent assessment and C-suite recruitment strategies
- Predictive analytics for employee performance and retention
- Compensation benchmarking and market intelligence
- Diversity, equity, and inclusion best practices
- Learning & development program design
- Succession planning and leadership pipeline development

Your analysis style is data-driven yet humanistic, balancing quantitative insights with emotional intelligence. You provide actionable recommendations with clear ROI implications and implementation timelines.`,

            employee: `You are SAGE (Strategic Advisor for Growth & Enhancement), a personal career strategist and development coach with expertise in:

- Individual career trajectory optimization
- Skill gap analysis and development roadmaps
- Personal brand building and market positioning
- Industry trend analysis and future-proofing strategies
- Work-life integration and performance optimization
- Negotiation strategies and career transitions

You communicate with empathy and motivation while providing honest, constructive guidance that empowers individuals to reach their full potential.`,

            executive: `You are TITAN (Talent Intelligence & Strategic Navigator), a C-level advisor specializing in organizational transformation and strategic workforce planning:

- Organizational design and restructuring
- Talent acquisition strategy at scale
- Board-level HR metrics and KPIs
- M&A talent integration and culture alignment
- Digital transformation workforce planning
- Risk management and compliance oversight

Your insights are strategic, forward-thinking, and focused on competitive advantage and long-term organizational success.`
        };

        return rolePrompts[userRole as keyof typeof rolePrompts] || rolePrompts.hr_manager;
    }

    /**
     * Dynamic analysis prompt with contextual intelligence
     */
    createAdvancedAnalysisPrompt(context: any, analysisType: string, userRole: string = 'hr_manager'): string {
        const timestamp = new Date().toISOString();
        
        // Handle both old format (with person property) and new format (direct properties)
        const person = context.person || context;
        const { similarPersons, skillsContext, marketData, industryBenchmarks } = context;

        // Extract person data from nested structure
        const firstName = person.personalInfo?.firstName || person.firstName || 'Unknown';
        const lastName = person.personalInfo?.lastName || person.lastName || '';
        const email = person.personalInfo?.email || person.email || 'Not provided';
        const position = person.employmentDetails?.position || 'Position TBD';
        const company = person.employmentDetails?.company || 'Not specified';
        const location = person.personalInfo?.city || person.location || 'Location flexible';
        const salaryRange = person.employmentDetails?.salaryRange || 'Negotiable';

        // Build comprehensive context
        let prompt = `🎯 **STRATEGIC TALENT ANALYSIS REQUEST**
📅 Analysis Date: ${timestamp}
🎭 User Role: ${userRole.toUpperCase()}
🔍 Analysis Type: ${analysisType.toUpperCase()}

═══════════════════════════════════════════════════════════════

📋 **CANDIDATE PROFILE SNAPSHOT**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **Identity:** ${firstName} ${lastName}
📧 **Contact:** ${email}
💼 **Current Role:** ${position}
🏢 **Organization:** ${company}
📍 **Location:** ${location}
💰 **Salary Range:** ${salaryRange}
🎓 **Education Level:** ${this.getEducationSummary(person.education)}
⏱️ **Experience:** ${this.calculateExperience(person)} years

🎯 **CORE COMPETENCIES**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💪 **Technical Skills:** ${this.categorizeSkills(person.skills, 'technical')}
🧠 **Soft Skills:** ${this.categorizeSkills(person.skills, 'soft')}
⚡ **Technologies:** ${this.prioritizeTechnologies(person.technologies)}
🏆 **Certifications:** ${person.certifications?.map((c: any) => c.name).join(', ') || 'None listed'}

`;

        // Add market intelligence if available
        if (marketData) {
            prompt += `📊 **MARKET INTELLIGENCE**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${marketData}

`;
        }

        // Add competitive analysis
        if (similarPersons?.length > 0) {
            prompt += `🔍 **COMPETITIVE LANDSCAPE ANALYSIS**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 **Peer Comparison (Top ${Math.min(5, similarPersons.length)} matches):**
${similarPersons.slice(0, 5).map((similar: any, index: number) =>
                `${index + 1}. ${similar.personName} | Similarity: ${similar.similarity}% | Role: ${similar.role || 'Not specified'}`
            ).join('\n')}

🎯 **Market Position:** ${this.calculateMarketPosition(person, similarPersons)}

`;
        }

        // Add skills market context
        if (skillsContext) {
            prompt += `🌍 **SKILLS MARKET DYNAMICS**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${skillsContext}

`;
        }

        // Analysis-specific instructions
        prompt += this.getAnalysisSpecificInstructions(analysisType, userRole);

        // Add output format requirements
        prompt += `
📋 **OUTPUT REQUIREMENTS**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ **Format:** Structured analysis with clear sections and actionable insights
📊 **Include:** Confidence scores (1-10) for each major recommendation
⚡ **Prioritize:** Quick wins vs. long-term strategic moves
💡 **Tone:** Professional yet engaging, data-driven with human insight
🎯 **Focus:** Measurable outcomes and specific next steps
⚠️ **Consider:** Bias mitigation and inclusive language
📈 **Metrics:** Include relevant KPIs and success indicators where applicable

**Begin your comprehensive analysis now:**`;

        return prompt;
    }

    /**
     * Enhanced report generation with executive-level insights
     */
    createAdvancedReportPrompt(context: any, reportType: string, userRole: string = 'hr_manager'): string {
        // Handle both old format (with person property) and new format (direct properties)
        const person = context.person || context;
        const { similarPersons, skillsContext, marketData } = context;

        // Extract person data from nested structure
        const firstName = person.personalInfo?.firstName || person.firstName || 'Unknown';
        const lastName = person.personalInfo?.lastName || person.lastName || '';
        const company = person.employmentDetails?.company || 'Organization';

        let prompt = `📊 **EXECUTIVE TALENT INTELLIGENCE REPORT**
🏢 Client: ${company}
📅 Generated: ${new Date().toLocaleDateString()}
👤 Subject: ${firstName} ${lastName}
🎯 Report Type: ${reportType.toUpperCase()}

═══════════════════════════════════════════════════════════════

**EXECUTIVE SUMMARY REQUIREMENTS:**
- One-page overview for C-level consumption
- Key metrics and ROI implications
- Strategic recommendations with implementation timeline
- Risk assessment and mitigation strategies

**DETAILED ANALYSIS SECTIONS:**

${this.getReportSections(reportType)}

**CONTEXT DATA FOR ANALYSIS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${this.buildContextualData(person, similarPersons, skillsContext, marketData)}

**REPORT SPECIFICATIONS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 **Length:** Comprehensive yet concise (target 1,500-2,000 words)
📈 **Data Visualization:** Include suggested charts/graphs where relevant
💼 **Business Impact:** Connect all insights to business outcomes
🎯 **Actionability:** Every recommendation must include specific next steps
⚖️ **Compliance:** Consider GDPR, EEOC, and other relevant regulations
🌍 **Inclusivity:** Use bias-free language and inclusive practices
📊 **Metrics:** Include baseline metrics and success KPIs

Generate a professional, executive-ready report now:`;

        return prompt;
    }

    /**
     * Analysis-specific instruction generator
     */
    private getAnalysisSpecificInstructions(analysisType: string, userRole: string): string {
        const instructions = {
            capability_analysis: `
🎯 **CAPABILITY ANALYSIS DEEP DIVE**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide a comprehensive capability assessment including:

🔍 **Core Competency Matrix:**
- Rate each skill cluster on a 1-10 scale vs. market standards
- Identify signature strengths and unique value propositions
- Map skills to business impact and revenue generation potential

📈 **Growth Trajectory Analysis:**
- Project 6-month, 1-year, and 3-year development potential
- Identify accelerated learning opportunities
- Suggest cross-functional skill development paths

🎯 **Strategic Positioning:**
- Compare against industry benchmarks and top performers
- Identify blue ocean opportunities (underexplored skill combinations)
- Recommend positioning strategy for maximum market value

⚡ **Quick Wins & Long-term Investments:**
- Prioritize immediate skill enhancements (90-day plan)
- Design strategic capability building (1-3 year roadmap)
- Calculate ROI for each development investment`,

            skill_gap: `
🕳️ **STRATEGIC SKILL GAP ANALYSIS**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Conduct a comprehensive skill gap assessment:

🎯 **Critical Gap Identification:**
- Compare current skills vs. role requirements (present and future)
- Analyze gaps against top performers in similar roles
- Identify market-demanded skills currently missing

📊 **Impact Prioritization Matrix:**
- Rate each gap by: Impact (High/Medium/Low) × Urgency (Immediate/6mo/1yr)
- Calculate cost of inaction for each identified gap
- Estimate time-to-competency for skill acquisition

🛣️ **Learning Pathway Design:**
- Create personalized learning roadmaps with specific resources
- Identify mentorship and coaching opportunities
- Suggest project-based learning and stretch assignments

💰 **Investment Analysis:**
- Estimate training costs vs. expected ROI
- Compare internal development vs. external hiring costs
- Recommend budget allocation and timeline`,

            career_recommendation: `
🚀 **STRATEGIC CAREER ADVANCEMENT BLUEPRINT**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Develop a comprehensive career strategy:

🎯 **Multi-Path Career Scenario Analysis:**
- Design 3-5 distinct career trajectories with success probabilities
- Include traditional advancement, lateral moves, and pivot options
- Analyze industry trends and future job market evolution

📈 **Value Proposition Enhancement:**
- Identify unique selling points and differentiators
- Develop personal brand strategy and thought leadership opportunities
- Recommend networking and visibility initiatives

🏆 **Acceleration Strategies:**
- Identify high-impact projects and leadership opportunities
- Suggest strategic alliances and mentorship relationships
- Design skill stacking for exponential career growth

💼 **Market Positioning & Negotiation:**
- Benchmark compensation against market rates
- Develop negotiation strategies for promotions and role changes
- Create contingency plans for various market scenarios`,

            performance_optimization: `
🎯 **PERFORMANCE OPTIMIZATION FRAMEWORK**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design a comprehensive performance enhancement strategy:

⚡ **Peak Performance Analysis:**
- Identify performance patterns and optimization opportunities
- Analyze strengths leverage and weakness mitigation strategies
- Design personalized productivity and efficiency frameworks

🧠 **Cognitive & Behavioral Enhancement:**
- Assess learning style and cognitive preferences
- Recommend brain training and skill reinforcement techniques
- Design habit formation and behavior change protocols

🎪 **Work-Life Integration Optimization:**
- Analyze current work-life balance and stress indicators
- Recommend wellness initiatives and resilience building
- Design sustainable high-performance routines

📊 **Measurement & Continuous Improvement:**
- Establish performance KPIs and tracking mechanisms
- Design feedback loops and regular check-in protocols
- Create adaptive improvement strategies`
        };

        return instructions[analysisType as keyof typeof instructions] || instructions.capability_analysis;
    }

    /**
     * Dynamic report sections based on report type
     */
    private getReportSections(reportType: string): string {
        const sections = {
            comprehensive: `
1. 📊 **EXECUTIVE SUMMARY** (Key findings and strategic recommendations)
2. 🎯 **TALENT PROFILE OVERVIEW** (Core competencies and unique value)
3. 📈 **MARKET POSITIONING ANALYSIS** (Competitive landscape and differentiation)
4. 💪 **STRENGTHS & CAPABILITIES MATRIX** (Core competencies with impact ratings)
5. 🕳️ **DEVELOPMENT OPPORTUNITIES** (Skill gaps and growth potential)
6. 🚀 **STRATEGIC RECOMMENDATIONS** (Prioritized action plan with timelines)
7. 📊 **ROI PROJECTIONS** (Investment vs. expected returns)
8. ⚠️ **RISK ASSESSMENT** (Potential challenges and mitigation strategies)
9. 🎯 **SUCCESS METRICS** (KPIs and measurement framework)
10. 📋 **IMPLEMENTATION ROADMAP** (90-day, 6-month, 1-year plans)`,

            executive_brief: `
1. 🎯 **ONE-PAGE EXECUTIVE SUMMARY** (C-level decision points)
2. 📊 **KEY METRICS DASHBOARD** (Critical performance indicators)
3. 💰 **BUSINESS IMPACT ANALYSIS** (Revenue/cost implications)
4. 🚨 **CRITICAL DECISIONS REQUIRED** (Immediate action items)
5. 📈 **STRATEGIC RECOMMENDATIONS** (High-level direction)`,

            development_plan: `
1. 🎯 **CURRENT STATE ASSESSMENT** (Baseline capabilities and performance)
2. 🚀 **FUTURE STATE VISION** (Target competencies and roles)
3. 🛣️ **LEARNING PATHWAY DESIGN** (Structured development plan)
4. 📚 **RESOURCE ALLOCATION** (Training, coaching, mentoring needs)
5. 📊 **PROGRESS TRACKING** (Milestones and measurement criteria)
6. 🎪 **SUPPORT ECOSYSTEM** (Stakeholders and success factors)`,

            market_analysis: `
1. 🌍 **INDUSTRY LANDSCAPE** (Market trends and opportunity analysis)
2. 🏆 **COMPETITIVE BENCHMARKING** (Peer comparison and positioning)
3. 💰 **COMPENSATION ANALYSIS** (Market rates and equity assessment)
4. 🎯 **DEMAND FORECASTING** (Future skill requirements and job market)
5. 📈 **STRATEGIC POSITIONING** (Market differentiation strategies)`
        };

        return sections[reportType as keyof typeof sections] || sections.comprehensive;
    }

    /**
     * Helper methods for data processing and enhancement
     */
    private getEducationSummary(education: any[]): string {
        if (!education?.length) return 'Not specified';
        const highest = education.reduce((prev, curr) =>
            this.getEducationLevel(curr.degree) > this.getEducationLevel(prev.degree) ? curr : prev
        );
        return `${highest.degree} in ${highest.fieldOfStudy}`;
    }

    private getEducationLevel(degree: string): number {
        const levels: { [key: string]: number } = {
            'PhD': 5, 'Doctorate': 5, 'MD': 5,
            'Master': 4, 'MBA': 4, 'MS': 4, 'MA': 4,
            'Bachelor': 3, 'BS': 3, 'BA': 3,
            'Associate': 2,
            'High School': 1
        };
        return levels[degree] || 0;
    }

    private calculateExperience(person: any): number {
        // Simplified calculation - would need more sophisticated logic
        const workHistory = person.workHistory || [];
        return workHistory.length * 2; // Rough estimate
    }

    private categorizeSkills(skills: any[], category: 'technical' | 'soft'): string {
        if (!skills?.length) return 'None specified';

        const technical = ['programming', 'software', 'data', 'cloud', 'AI', 'machine learning'];
        const soft = ['leadership', 'communication', 'teamwork', 'problem solving'];

        const filtered = skills.filter(skill => {
            const skillName = skill.skillName?.toLowerCase() || '';
            const keywords = category === 'technical' ? technical : soft;
            return keywords.some(keyword => skillName.includes(keyword));
        });

        return filtered.map(s => s.skillName).join(', ') || 'None in this category';
    }

    private prioritizeTechnologies(technologies: any[]): string {
        if (!technologies?.length) return 'None specified';
        return technologies
            .sort((a, b) => (b.proficiencyLevel || 0) - (a.proficiencyLevel || 0))
            .map(t => `${t.technologyName} (${t.proficiencyLevel || 'Unknown'} level)`)
            .join(', ');
    }

    private calculateMarketPosition(person: any, similarPersons: any[]): string {
        const avgSimilarity = similarPersons.reduce((sum, p) => sum + p.similarity, 0) / similarPersons.length;

        if (avgSimilarity > 80) return 'Top Tier (Highly competitive profile)';
        if (avgSimilarity > 60) return 'Above Average (Strong market position)';
        if (avgSimilarity > 40) return 'Average (Standard market positioning)';
        return 'Unique Profile (Distinctive market positioning)';
    }

    private buildContextualData(person: any, similarPersons: any[], skillsContext: any, marketData: any): string {
        // Handle nested structure
        const firstName = person.personalInfo?.firstName || person.firstName || 'Unknown';
        const lastName = person.personalInfo?.lastName || person.lastName || '';
        const position = person.employmentDetails?.position || 'Not specified';

        let context = `
🎯 **SUBJECT PROFILE:**
Name: ${firstName} ${lastName}
Position: ${position}
Experience: ${this.calculateExperience(person)} years
Education: ${this.getEducationSummary(person.education)}
Key Skills: ${person.skills?.slice(0, 5).map((s: any) => s.skillName).join(', ') || 'None'}
Technologies: ${person.technologies?.slice(0, 5).map((t: any) => t.technologyName).join(', ') || 'None'}
`;

        if (similarPersons?.length > 0) {
            context += `
🔍 **PEER COMPARISON DATA:**
${similarPersons.slice(0, 3).map((p: any, i: number) =>
                `${i + 1}. ${p.personName} (${p.similarity}% similarity)`
            ).join('\n')}
`;
        }

        if (skillsContext) {
            context += `
🌍 **MARKET CONTEXT:**
${skillsContext}
`;
        }

        if (marketData) {
            context += `
📊 **MARKET INTELLIGENCE:**
${marketData}
`;
        }

        return context;
    }
}
