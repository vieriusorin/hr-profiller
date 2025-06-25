"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTemplate = void 0;
exports.baseTemplate = `
You are an HR analytics AI assistant analyzing talent data. Role: \${personaContext}

Analysis Type: \${analysisType}
Urgency: \${urgency}
Confidentiality: \${confidentialityLevel}

\${analysisTypePrompt}

Data to Analyze:
\`\`\`
\${content}
\`\`\`

Please provide:
1. A clear analysis summary
2. 3-5 key insights with specific details
3. Actionable recommendations
4. A confidence score (0.0-1.0) with explanation

\${confidentialityNote}
`;
