import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolRequest, type Tool, type ServerResult } from "@modelcontextprotocol/sdk/types.js";

import { tool as setModDirectoryTool, type SetModDirectoryParams } from './set_mod_directory.js';
import { tool as getModDirectoryTool } from './get_mod_directory.js';
import { tool as resetModDirectoryTool } from './reset_mod_directory.js';
import { tool as benchmarkListTool, handler as benchmarkListHandler } from './benchmark_list.js';

// Export all tools for server capabilities
export const tools = {
  set_mod_directory: setModDirectoryTool,
  get_mod_directory: getModDirectoryTool,
  reset_mod_directory: resetModDirectoryTool,
  benchmark_list: benchmarkListTool,
} satisfies Record<string, Tool>;

// Initialize tool handlers
export function setupTools(server: Server) {
  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.values(tools),
    };
  });

  // Register tool handlers
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'set_mod_directory': {
        if (!args || typeof args !== 'object' || !('directory' in args) || typeof args.directory !== 'string') {
          throw new Error('Invalid arguments for set_mod_directory - requires {directory: string}');
        }
        const params: SetModDirectoryParams = { directory: args.directory };
        return await (setModDirectoryTool.handler as (params: SetModDirectoryParams) => Promise<ServerResult>)(params);
      }
      case 'get_mod_directory': {
        return await (getModDirectoryTool.handler as (params: Record<string, never>) => Promise<ServerResult>)({});
      }
      case 'reset_mod_directory': {
        return await (resetModDirectoryTool.handler as (params: Record<string, never>) => Promise<ServerResult>)({});
      }
      case 'benchmark_list':
        return await benchmarkListHandler();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
} 