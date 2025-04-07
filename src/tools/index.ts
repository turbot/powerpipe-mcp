import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolRequest, type Tool, type ServerResult } from "@modelcontextprotocol/sdk/types.js";

import { tool as setModDirectoryTool } from './set_mod_directory.js';
import { tool as getModLocationTool } from './get_mod_location.js';
import { tool as resetModLocationTool } from './reset_mod_location.js';
import { tool as benchmarkListTool } from './benchmark_list.js';
import { tool as benchmarkShowTool } from './benchmark_show.js';
import { tool as benchmarkRunTool } from './benchmark_run.js';
import { tool as controlListTool } from './control_list.js';
import { tool as controlShowTool } from './control_show.js';
import { tool as controlRunTool } from './control_run.js';
import { tool as detectionListTool } from './detection_list.js';
import { tool as detectionShowTool } from './detection_show.js';
import { tool as detectionRunTool } from './detection_run.js';
import { tool as modListTool } from './mod_list.js';
import { tool as queryListTool } from './query_list.js';
import { tool as queryShowTool } from './query_show.js';
import { tool as variableListTool } from './variable_list.js';
import { tool as variableShowTool } from './variable_show.js';

// Export all tools for server capabilities
export const tools = {
  set_mod_directory: setModDirectoryTool,
  get_mod_location: getModLocationTool,
  reset_mod_location: resetModLocationTool,
  benchmark_list: benchmarkListTool,
  benchmark_show: benchmarkShowTool,
  benchmark_run: benchmarkRunTool,
  control_list: controlListTool,
  control_show: controlShowTool,
  control_run: controlRunTool,
  detection_list: detectionListTool,
  detection_show: detectionShowTool,
  detection_run: detectionRunTool,
  mod_list: modListTool,
  query_list: queryListTool,
  query_show: queryShowTool,
  variable_list: variableListTool,
  variable_show: variableShowTool,
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
    const tool = tools[name as keyof typeof tools];

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    if (!tool.handler) {
      throw new Error(`Tool ${name} has no handler defined`);
    }

    // Each tool is responsible for validating its own parameters
    return await (tool.handler as (args: unknown) => Promise<ServerResult>)(args || {});
  });
} 