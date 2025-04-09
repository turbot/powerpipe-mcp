import { ListResourceTemplatesRequestSchema, type ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Export all resource templates for server capabilities
export const resourceTemplates: Record<string, ResourceTemplate> = {};

export function setupResourceTemplates(server: Server) {
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: Object.values(resourceTemplates)
    };
  });
} 