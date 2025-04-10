import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolRequest, type Tool, type ServerResult } from "@modelcontextprotocol/sdk/types.js";

// Most Frequently Used Operations
import { tool as benchmarkListTool } from './benchmark_list.js';
import { tool as benchmarkShowTool } from './benchmark_show.js';
import { tool as benchmarkRunTool } from './benchmark_run.js';
import { tool as controlListTool } from './control_list.js';
import { tool as controlShowTool } from './control_show.js';
import { tool as controlRunTool } from './control_run.js';

// Secondary Operations
import { tool as detectionListTool } from './detection_list.js';
import { tool as detectionShowTool } from './detection_show.js';
import { tool as detectionRunTool } from './detection_run.js';
import { tool as queryListTool } from './query_list.js';
import { tool as queryShowTool } from './query_show.js';

// Configuration & Utilities
import { tool as modLocationTool } from './mod_location.js';
import { tool as variableListTool } from './variable_list.js';
import { tool as variableShowTool } from './variable_show.js';
import { tool as docsHclTool } from './docs_hcl.js';

// Powerpipe
import { tool as dashboard_list } from "./dashboard_list.js";
import { tool as dashboard_show } from "./dashboard_show.js";
import { tool as dashboard_run } from "./dashboard_run.js";

// Export all tools for server capabilities
export const tools = {
  // Most Frequently Used Operations
  benchmark_list: benchmarkListTool,    // Primary entry point for users finding benchmarks
  benchmark_show: benchmarkShowTool,    // Detailed benchmark info
  benchmark_run: benchmarkRunTool,      // Running benchmarks - core operation

  control_list: controlListTool,        // Finding available controls
  control_show: controlShowTool,        // Control details
  control_run: controlRunTool,          // Running controls - core operation

  // Secondary Operations
  detection_list: detectionListTool,    // Less commonly used than benchmarks/controls
  detection_show: detectionShowTool,
  detection_run: detectionRunTool,

  query_list: queryListTool,           // More technical/advanced usage
  query_show: queryShowTool,

  // Configuration & Utilities
  mod_location: modLocationTool,       // Usually set once and rarely changed
  variable_list: variableListTool,     // Supporting operations
  variable_show: variableShowTool,

  // Documentation
  docs_hcl: docsHclTool,               // HCL documentation lookup

  // Powerpipe
  dashboard_list,
  dashboard_show,
  dashboard_run
};

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