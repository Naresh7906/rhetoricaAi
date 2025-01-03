import { Message } from "@/pages/employee/voice-model";

interface ConversationMetrics {
  overallPerformance: number;  // 0-100 score
  summary: string;
  softSkills: {
    empathy: number;          // 0-100 score
    professionalism: number;  // 0-100 score
    communication: number;    // 0-100 score
    conflictResolution: number; // 0-100 score
  };
  keyAreas: {
    strengths: string[];
    improvementAreas: string[];
  };
  scenarioHandling: {
    situationAwareness: number;  // 0-100 score
    solutionEffectiveness: number;  // 0-100 score
    stressManagement: number;  // 0-100 score
  };
  actionableRecommendations: string[];
}

const systemPrompt = `You are a professional soft skills and communication coach evaluating a user's performance in a business scenario. Focus your analysis ONLY on the user's responses, using the AI assistant's messages solely for understanding context.

When analyzing, consider:
1. How well the user responds to the scenario
2. The quality and professionalism of their communication
3. Their ability to handle the situation effectively

Evaluate the following aspects and provide scores (0-100) based ONLY on the user's responses:

1. Overall Performance Assessment:
   Score based on the user's overall handling of the conversation and scenario objectives.

2. Soft Skills Analysis:
   - Empathy: How well they understand and acknowledge the situation and others' perspectives
   - Professionalism: Their level of business etiquette and appropriate workplace communication
   - Communication: Clarity, structure, and effectiveness of their messages
   - Conflict Resolution: How they address and navigate challenging aspects of the conversation

3. Scenario-Specific Handling:
   - Situation Awareness: Understanding of the business context and requirements
   - Solution Effectiveness: Quality and practicality of their proposed ideas and responses
   - Stress Management: Maintaining composure and professionalism throughout

4. Key Areas:
   - Notable strengths shown in their responses
   - Specific areas where their responses could improve

5. Actionable Recommendations: 
   Specific, practical tips for improving their communication and scenario handling

Format the response as a JSON object with the following structure:
{
  "overallPerformance": number,
  "summary": "concise performance summary focusing on user's responses",
  "softSkills": {
    "empathy": number,
    "professionalism": number,
    "communication": number,
    "conflictResolution": number
  },
  "keyAreas": {
    "strengths": ["string"],
    "improvementAreas": ["string"]
  },
  "scenarioHandling": {
    "situationAwareness": number,
    "solutionEffectiveness": number,
    "stressManagement": number
  },
  "actionableRecommendations": ["string"]
}

IMPORTANT: 
- Focus analysis ONLY on the user's responses
- Use AI responses only for understanding context
- Return only the JSON object without any markdown formatting
- Ensure all numeric scores are between 0-100`;

export async function analyzeConversation(
  messages: Message[],
  deploymentName: string
): Promise<ConversationMetrics> {
  try {
    // Separate user and assistant messages for context
    const userMessages = messages.filter(msg => msg.type === "user");
    const assistantMessages = messages.filter(msg => msg.type === "assistant");
    
    // Format conversation to emphasize user responses
    const conversationText = `
Context (AI Responses):
${assistantMessages.map(msg => `AI: ${msg.content}`).join("\n")}

User Responses to Analyze:
${userMessages.map(msg => `User: ${msg.content}`).join("\n")}`;

    const response = await fetch(`${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}openai/deployments/${deploymentName}/chat/completions?api-version=2023-07-01-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": import.meta.env.VITE_AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: conversationText,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze conversation");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Remove any markdown code block formatting if present
    content = content.replace(/^```json\n|\n```$/g, '');
    
    try {
      const analysis = JSON.parse(content);
      return analysis;
    } catch (parseError) {
      console.error("Failed to parse response:", content);
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    throw error;
  }
} 