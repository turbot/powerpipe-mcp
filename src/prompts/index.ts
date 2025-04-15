import { ListPromptsRequestSchema, GetPromptRequestSchema, type Prompt, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { BEST_PRACTICES_PROMPT, handleBestPracticesPrompt } from "./best_practices.js";

// Export all prompts for server capabilities
export const prompts = {
  best_practices: BEST_PRACTICES_PROMPT
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

    switch (name) {
      case BEST_PRACTICES_PROMPT.name:
        return handleBestPracticesPrompt();

      default:
        throw new Error(`Handler not implemented for prompt: ${name}`);
    }
  });
} 