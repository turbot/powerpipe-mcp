import { ListPromptsRequestSchema, GetPromptRequestSchema, type Prompt, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { prompt as bestPracticesPrompt } from "./best_practices.js";

// Export all prompts for server capabilities
export const prompts = {
  best_practices: bestPracticesPrompt
};

export function setupPrompts(server: Server) {
  // Register prompt list handler
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: Object.values(prompts),
    };
  });

  // Register prompt get handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;
    const prompt = prompts[name as keyof typeof prompts];

    if (!prompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    return prompt.handler();
  });
} 