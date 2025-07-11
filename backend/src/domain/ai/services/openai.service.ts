import 'dotenv/config';
import { injectable } from 'inversify';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, embed, embedMany, cosineSimilarity } from 'ai';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@injectable()
export class OpenAIService {
  private provider: ReturnType<typeof createOpenAI>;
  private embeddingModel: string;
  private chatModel: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Initialize AI SDK provider
    this.provider = createOpenAI({
      apiKey,
      compatibility: 'strict',
      
    });

    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
  }

  /**
   * Generate embeddings for text using AI SDK
   * @param text - The input text to generate embeddings for
   * @returns Promise resolving to an EmbeddingResult containing the embedding vector and usage information
   */
  async generateEmbeddings(text: string): Promise<EmbeddingResult> {
    try {
      const { embedding, usage } = await embed({
        model: this.provider.embedding(this.embeddingModel),
        value: text,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(30000), // 30 second timeout for single embedding
      });

      return {
        embedding,
        model: this.embeddingModel,
        usage: {
          promptTokens: usage.tokens,
          totalTokens: usage.tokens,
        },
      };
    } catch (error: any) {
      console.error('Error generating embeddings with AI SDK:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }



  /**
   * Generate embeddings for multiple texts using AI SDK
   * @param texts - Array of input texts to generate embeddings for
   * @returns Promise resolving to an array of EmbeddingResult containing the embedding vectors and usage information
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      const { embeddings, usage } = await embedMany({
        model: this.provider.embedding(this.embeddingModel),
        values: texts,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000), // 60 second timeout for batch
      });

      return embeddings.map((embedding) => ({
        embedding,
        model: this.embeddingModel,
        usage: {
          promptTokens: usage.tokens,
          totalTokens: usage.tokens,
        },
      }));
    } catch (error: any) {
      console.error('Error generating batch embeddings with AI SDK:', error);
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }



  /**
   * Generate chat completion using AI SDK
   * @param messages - Array of message objects representing the chat history
   * @param temperature - Sampling temperature for the model (default is 0.4)
   */
  async generateChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number = 0.4
  ): Promise<ChatCompletionResult> {
    try {
      const { text, usage } = await generateText({
        model: this.provider(this.chatModel),
        messages,
        temperature,
        maxTokens: 2000,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000), // 60 second timeout
      });

      return {
        content: text,
        model: this.chatModel,
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
        },
      };
    } catch (error: any) {
      console.error('Error generating chat completion with AI SDK:', error);
      throw new Error(`Failed to generate chat completion: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * This is a utility function that comes with AI SDK
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    return cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Generate person analysis using AI
   * This function analyzes a person's profile and suggests an internal grade based on provided criteria.
   * @param personData - The person's profile data to analyze
   * @param context - Optional additional context for the analysis
   */
  async analyzePerson(personData: any, context?: string): Promise<string> {
    const systemPrompt = `
      Role
      You are an expert HR analyst and job classification specialist. Your task is to analyze job descriptions and determine the appropriate experience level based on provided grade descriptions and requirements.
      Task Overview
      Given a job description and a set of grade descriptions with their associated experience levels, you must:

      Extract key requirements from the job description
      Match these requirements against the grade descriptions
      Suggest the most appropriate experience level
      Provide confidence score and detailed reasoning

      Input Format
      You will receive:

      Job Description: Full text of the job posting
      Grade Descriptions: Array of grade objects with experience level mappings
      Available Experience Levels: List of possible experience levels (e.g., Entry, Junior, Mid, Senior, Lead, Principal)

      Analysis Framework
      1. Key Factors to Evaluate

      Years of Experience: Explicit or implied experience requirements
      Technical Skills Complexity: Depth and breadth of required skills
      Leadership Responsibilities: Team management, mentoring, strategic planning
      Decision-Making Authority: Level of autonomy and impact
      Project Scope: Size and complexity of projects/initiatives
      Educational Requirements: Degree level, certifications, specializations
      Industry Knowledge: Domain expertise requirements
      Stakeholder Interaction: Level of client/executive interaction

      2. Internal Grade Structure with Detailed Criteria
      Level 1 - Junior Technician (JT)

      Experience: < 1 year
      Level Keyword: Follow
      Theory: Basic knowledge
      Experience Indicators:

      No experience or < 1 year on simple, repetitive tasks
      Entry-level positions, internships, graduate programs

      Autonomy: Without autonomy

      Needs support from colleagues/supervisors
      Requires additional explanations for each task
      Needs coaching and career path definition


      Job Description Signals: "Entry-level", "no experience required", "training provided", "mentorship available"

      Level 2 - Technician (T)

      Experience: 1+ years
      Level Keyword: Assist
      Theory: Basic + specific intermediate theory background
      Experience Indicators:

      Starts applying theory on projects with support
      Gaining experience on specific tasks
      Some familiarity with tools and processes


      Autonomy: Starting to gain autonomy

      More independence with colleagues
      Still needs full coordination/support with stakeholders


      Job Description Signals: "Assistant", "support role", "1-2 years experience", "with guidance"

      Level 3 - Senior Technician (ST)

      Experience: 2+ years
      Level Keyword: Apply
      Theory: Intermediate level
      Experience Indicators:

      Comes up with solutions and has process overview
      Works easier on new tasks, makes task estimates
      Influences colleagues and offers them support


      Autonomy: More autonomy

      Including with stakeholders, but not on completely new tasks
      Needs to confirm certain solutions with supervisors


      Job Description Signals: "2-3 years experience", "problem-solving", "mentoring juniors", "some independence"

      Level 4 - Engineer (EN)

      Experience: 3+ years
      Level Keyword: Enable
      Theory: Good level of technical information
      Experience Indicators:

      Good understanding of project and whole process
      Provides solutions that optimize project work
      Technical competency across multiple areas


      Autonomy:

      Develops customer relationships and influences them
      Makes autonomous decisions on tools/technologies
      Autonomous in escalating issues


      Coaching/Leadership: Can supervise or coach 1-2 junior colleagues
      Job Description Signals: "3-5 years experience", "technical leadership", "customer interaction", "technology choices", "mentoring"

      Level 5 - Senior Engineer (SE)

      Experience: 5+ years
      Level Keyword: Ensure and advise
      Theory: Good level of technical and commercial information
      Experience Indicators:

      Has specialist expertise for complex solutions
      Focus on project efficiency, performance, risk identification


      Autonomy:

      Influences relationships with colleagues and clients/stakeholders
      Observes and brings solutions for project optimization


      Coaching/Leadership: Can coordinate and coach more than 2 people
      Job Description Signals: "5-7 years experience", "technical expert", "team coordination", "risk management", "client relationships"

      Level 6 - Consultant (C)

      Experience: 8+ years
      Level Keyword: Influence
      Theory: Becoming an expert
      Experience Indicators:

      Involved in stakeholder coordination
      Provides technical solutions from project beginning
      Involved in commercial aspects and risk management


      Autonomy: Full autonomy with colleagues, clients, stakeholders
      Coaching/Leadership: Influences entire team behavior
      Job Description Signals: "8+ years experience", "stakeholder management", "commercial involvement", "risk management", "team influence"

      Level 6 - Senior Consultant (SC)

      Experience: 8+ years
      Level Keyword: Initiate and influence
      Theory: Expert level
      Experience Indicators:

      Thinks strategically, makes connections between solutions
      Has overview of whole development process
      Influences at business, organizational, and external levels


      Autonomy: Full autonomy on all delivery process stages
      Coaching/Leadership: Becoming a "role model"
      Job Description Signals: "Senior consultant", "strategic thinking", "business influence", "process oversight", "role model", "thought leadership"

      Level 7 - Management Level (ML)

      Experience: 12+ years
      Level Keyword: Set strategy, inspire and mobilize
      Theory: Expert level
      Experience Indicators:

      Influences whole business, organization and externally
      Focus on results and business opportunities identification
      Strategic vision and execution


      Autonomy: Full autonomy on delivery and commercial processes
      Management: Forms teams, disciplines, departments
      Job Description Signals: "12+ years experience", "executive level", "team formation", "business strategy", "organizational influence", "P&L responsibility"

      4. Matching Process

      Extract Requirements: Identify explicit and implicit requirements from job description
      Experience Assessment: Map stated or implied experience requirements to internal grade levels
      Four-Dimension Analysis: Evaluate Theory, Experience, Autonomy, and Leadership levels
      Level Keyword Alignment: Determine which level keyword best matches role responsibilities
      Cross-Validation: Ensure consistency across all four dimensions
      Grade Selection: Choose appropriate internal grade with consideration for Level 6 dual track
      Confidence Calculation: Assess certainty based on clarity and alignment of all criteria

      Output Format
      Return a JSON object with the following structure:
      json{
        "suggested_internal_grade": "Level 4 - Engineer (EN)",
        "level_keyword": "Enable",
        "confidence_score": 0.85,
        "experience_range": "3+ years",
        "key_requirements_extracted": [
          "3-5 years experience in software development",
          "Proficiency in React and Node.js",
          "Customer interaction and relationship building",
          "Technology decision-making autonomy",
          "Mentoring 1-2 junior developers"
        ],
        "reasoning": "This position requires 3-5 years of experience with technical expertise and project optimization focus. The combination of customer relationship development, autonomous technology decisions, and junior mentoring aligns perfectly with Level 4 Engineer criteria. The 'Enable' keyword fits well with enabling others through technical leadership and process optimization.",
        "dimension_analysis": {
          "theory_level": "Good - Strong technical information required",
          "experience_capability": "Good project understanding with solution optimization",
          "autonomy_level": "High - Customer relationships and technology decisions",
          "leadership_coaching": "Junior supervision - Can coach 1-2 people"
        },
        "level_keyword_alignment": {
          "enable_indicators": [
            "Customer relationship development",
            "Autonomous technology decisions", 
            "Project work optimization",
            "Junior colleague supervision"
          ]
        },
        "alternative_considerations": [
          {
            "level": "Level 5 - Senior Engineer (SE)",
            "probability": 0.25,
            "reason": "Could be Level 5 if more emphasis on coordinating multiple people and complex solution expertise"
          },
          {
            "level": "Level 3 - Senior Technician (ST)",
            "probability": 0.15,
            "reason": "Possible if customer interaction is limited and autonomy is restricted to known tasks"
          }
        ],
        "flags_for_review": []
      }
      Quality Guidelines
      High Confidence Indicators (0.8-1.0)

      Clear years of experience stated
      Specific technical requirements match grade descriptions
      Responsibility level clearly defined
      Strong alignment with multiple grade criteria

      Medium Confidence Indicators (0.5-0.79)

      Some ambiguity in requirements
      Partial match with grade descriptions
      Missing some key indicators
      Industry-specific considerations needed

      Low Confidence Indicators (0.0-0.49)

      Vague or contradictory requirements
      Poor match with available grades
      Unusual role structure
      Insufficient information provided

      Flags for Manual Review

      Conflicting experience requirements
      Unique or non-standard roles
      Significant salary misalignment
      Cross-functional hybrid positions
      Regulatory or compliance-heavy roles

      Special Considerations
      Level 6 Dual Track Decision (Consultant vs Senior Consultant)
      Both Level 6 positions require 8+ years experience but have different focus areas:
      Choose Consultant (C) when:

      Role emphasizes stakeholder coordination and commercial involvement
      Technical solutions from project beginning with risk management focus
      Full autonomy with clients but emphasis on influencing team behavior
      More tactical, project-focused influence

      Choose Senior Consultant (SC) when:

      Role emphasizes strategic thinking and solution connections
      Overview of whole development process with business/organizational influence
      Role model expectations and thought leadership requirements
      More strategic, organization-wide influence

      Four-Dimension Consistency Check
      Ensure all dimensions align with the suggested level:

      Theory + Experience should match (basic knowledge shouldn't pair with complex solutions)
      Autonomy should align with responsibility (high autonomy should include stakeholder relationships)
      Leadership should match scope (team influence requires coordination capabilities)
      Experience years should support other dimensions (strategic thinking requires sufficient experience)

      Industry and Context Adjustments

      Startup vs Enterprise: Adjust autonomy expectations based on company structure
      Technical vs Consulting: Consider whether role is delivery-focused (Engineer track) or advisory-focused (Consultant track)
      Client-facing vs Internal: Higher autonomy requirements for external stakeholder interaction
      Team size context: Leadership expectations should match team/organization size

      Role Ambiguities

      When multiple levels seem appropriate, choose the middle ground
      For borderline cases, lean toward the level with better long-term growth
      Consider total compensation packages
      Account for geographic market differences

      Error Prevention

      Always suggest one of the 7 internal grade levels with proper format: "Level X - Title (Abbreviation)"
      For Level 6, specify whether Consultant (C) or Senior Consultant (SC) based on strategic vs tactical focus
      Ensure all four dimensions (Theory, Experience, Autonomy, Leadership) are consistent with suggested level
      Flag cases where experience years don't align with other dimension requirements
      Always provide reasoning that references specific criteria from the level definitions

      Context Awareness

      Consider the company size and stage (startup vs. enterprise)
      Account for industry-specific experience requirements
      Factor in remote work implications
      Consider current job market conditions
    `;

    const userPrompt = `Analyze the following person profile and return the suggested internal grade:
    
    ${JSON.stringify(personData, null, 2)}
    
    ${context ? `\nAdditional context: ${context}` : ''}
    
    Provide a comprehensive analysis focusing on their capabilities, strengths, and areas for development.`;

    const result = await this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return result.content;
  }

  /**
   * Generate person report using AI
   */
  async generatePersonReport(personData: any, reportType: string = 'comprehensive'): Promise<string> {
    const systemPrompt = `You are an HR AI assistant creating professional reports for person profiles.
    Generate well-structured, professional reports that can be used for:
    - Hiring decisions
    - Performance reviews
    - Career development planning
    - Skill gap analysis
    
    Use clear sections, bullet points, and professional language.`;

    const reportPrompts = {
      comprehensive: 'Create a comprehensive report covering all aspects of the person profile',
      skills: 'Focus on technical skills and capabilities analysis',
      career: 'Focus on career progression and development recommendations',
      summary: 'Create a concise executive summary of the person profile',
    };

    const userPrompt = `Generate a ${reportType} report for the following person:
    
    ${JSON.stringify(personData, null, 2)}
    
    ${reportPrompts[reportType as keyof typeof reportPrompts] || reportPrompts.comprehensive}`;

    const result = await this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return result.content;
  }

  /**
   * Generate searchable text for person embedding
   */
  generatePersonSearchableText(person: any): string {
    const parts = [];

    // Basic info
    parts.push(`${person.firstName} ${person.lastName}`);
    parts.push(person.email);
    if (person.notes) parts.push(person.notes);

    // Skills
    if (person.skills && person.skills.length > 0) {
      const skillText = person.skills
        .map((s: any) => `${s.skillName} ${s.skillCategory || ''} ${s.proficiencyLevel || ''} ${s.yearsOfExperience || ''} years`)
        .join(' ');
      parts.push(skillText);
    }

    // Technologies
    if (person.technologies && person.technologies.length > 0) {
      const techText = person.technologies
        .map((t: any) => `${t.technologyName} ${t.technologyCategory || ''} ${t.technologyLevel || ''} ${t.yearsOfExperience || ''} years`)
        .join(' ');
      parts.push(techText);
    }

    // Education
    if (person.education && person.education.length > 0) {
      const eduText = person.education
        .map((e: any) => `${e.institution} ${e.degree || ''} ${e.fieldOfStudy || ''}`)
        .join(' ');
      parts.push(eduText);
    }

    return parts.join(' ').toLowerCase();
  }
} 