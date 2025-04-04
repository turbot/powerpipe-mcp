import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolRequest, type Tool, type ServerResult } from "@modelcontextprotocol/sdk/types.js";

import { tool as setModDirectoryTool, type SetModDirectoryParams } from './set_mod_directory.js';
import { tool as getModDirectoryTool } from './get_mod_directory.js';
import { tool as resetModDirectoryTool } from './reset_mod_directory.js';
import { tool as benchmarkListTool, handler as benchmarkListHandler } from './benchmark_list.js';
import { tool as benchmarkShowTool, handler as benchmarkShowHandler, type BenchmarkShowParams } from './benchmark_show.js';
import { tool as controlListTool, handler as controlListHandler } from './control_list.js';

// Export all tools for server capabilities
export const tools = {
  set_mod_directory: setModDirectoryTool,
  get_mod_directory: getModDirectoryTool,
  reset_mod_directory: resetModDirectoryTool,
  benchmark_list: benchmarkListTool,
  benchmark_show: benchmarkShowTool,
  control_list: controlListTool,
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
      case 'benchmark_show': {
        if (!args || typeof args !== 'object' || !('qualified_name' in args) || typeof args.qualified_name !== 'string') {
          throw new Error('Invalid arguments for benchmark_show - requires {qualified_name: string}');
        }
        const params: BenchmarkShowParams = { qualified_name: args.qualified_name };
        return await benchmarkShowHandler(params);
      }
      case 'control_list':
        return await controlListHandler();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
} 