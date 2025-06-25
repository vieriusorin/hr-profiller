export const reportSpecifications = `
**REPORT SPECIFICATIONS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 **Length:** Comprehensive yet concise (target 1,500-2,000 words)
📈 **Data Visualization:** Include suggested charts/graphs where relevant
💼 **Business Impact:** Connect all insights to business outcomes
🎯 **Actionability:** Every recommendation must include specific next steps
⚖️ **Compliance:** Consider GDPR, EEOC, and other relevant regulations
🌍 **Inclusivity:** Use bias-free language and inclusive practices
📊 **Metrics:** Include baseline metrics and success KPIs`;

export const reportTypes = {
  comprehensive: 'Create a comprehensive report covering all aspects of the person profile',
  skills: 'Focus on technical skills and capabilities analysis',
  career: 'Focus on career progression and development recommendations',
  summary: 'Create a concise executive summary of the person profile'
} as const;

export const contextTemplate = `
🎯 **SUBJECT PROFILE:**
Name: \${firstName} \${lastName}
Position: \${position}
Experience: \${experience} years
Education: \${education}
Key Skills: \${skills}
Technologies: \${technologies}

\${peerComparison}

\${marketContext}

\${marketIntelligence}
`;

export const peerComparisonTemplate = `
🔍 **PEER COMPARISON DATA:**
\${peers}
`;

export const marketContextTemplate = `
🌍 **MARKET CONTEXT:**
\${context}
`;

export const marketIntelligenceTemplate = `
📊 **MARKET INTELLIGENCE:**
\${data}
`; 