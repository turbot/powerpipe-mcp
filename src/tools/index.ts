import { ListToolsRequestSchema, CallToolRequestSchema, type CallToolRequest, type Tool } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { MOD_LIST_TOOL, handleModListTool } from './modList.js';

export * from './modList.js';

export function setupTools(server: Server) {
  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        MOD_LIST_TOOL,
      ] as Tool[],
    };
  });

  // Register unified tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case MOD_LIST_TOOL.name:
        return handleModListTool();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
} 