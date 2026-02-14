import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapData, UserConstraints } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

// Schema for structured JSON output
const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the roadmap" },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique string ID (e.g., 'n1')" },
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Short actionable summary" },
          type: { type: Type.STRING, enum: ["MILESTONE", "TASK", "DECISION"] },
          status: { type: Type.STRING, enum: ["PENDING"] },
          estimatedHours: { type: Type.NUMBER, description: "Time to complete in hours" },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["video", "article", "course", "repo"] }
              }
            }
          }
        },
        required: ["id", "title", "description", "type", "estimatedHours", "resources"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING, description: "Source node ID" },
          to: { type: Type.STRING, description: "Target node ID" }
        },
        required: ["from", "to"]
      }
    }
  },
  required: ["title", "nodes", "edges"]
};

export const generateRoadmap = async (constraints: UserConstraints): Promise<RoadmapData> => {
  const ai = getClient();

  const prompt = `
    Act as an expert AI Roadmap Orchestrator.
    Create a detailed, step-by-step learning or execution roadmap for the following goal: "${constraints.goal}".
    
    Context:
    - Current Skill Level: ${constraints.currentSkillLevel}
    - Available Time: ${constraints.hoursPerWeek} hours/week
    - Deadline: ${constraints.deadline || "None"}
    - Additional Context: ${constraints.additionalContext || "None"}

    Requirements:
    1. Break down the goal into logical nodes (Milestones/Tasks).
    2. Establish clear dependencies (edges) to form a Directed Acyclic Graph (DAG). Do NOT create circular dependencies.
    3. Estimate realistic hours for each node based on the user's skill level.
    4. Provide 2-3 high-quality, real-world learning resources for each node (e.g., specific YouTube topics, official docs, GitHub repos).
    5. Ensure the structure implies a progression from beginner to advanced topics if applicable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RoadmapData;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const pivotRoadmap = async (currentRoadmap: RoadmapData, pivotInstruction: string): Promise<RoadmapData> => {
  const ai = getClient();

  const prompt = `
    Act as an AI Roadmap Orchestrator.
    The user wants to modify their existing roadmap based on a new situation: "${pivotInstruction}".

    Current Roadmap JSON:
    ${JSON.stringify(currentRoadmap)}

    Instructions:
    1. Adjust the existing nodes and edges to accommodate the change.
    2. If the user is behind schedule, you might need to compress tasks or move deadlines.
    3. If the user wants to add a new skill, inject new nodes and connect them logically.
    4. Maintain the integrity of the graph (no cycles).
    5. Return the full updated roadmap JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as RoadmapData;
  } catch (error) {
    console.error("Gemini Pivot Error:", error);
    throw error;
  }
};
