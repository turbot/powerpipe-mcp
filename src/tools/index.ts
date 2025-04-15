import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolRequest, type Tool, type ServerResult } from "@modelcontextprotocol/sdk/types.js";

// Most Frequently Used Operations
import { tool as benchmarkListTool } from './powerpipe_benchmark_list.js';
import { tool as benchmarkShowTool } from './powerpipe_benchmark_show.js';
import { tool as benchmarkRunTool } from './powerpipe_benchmark_run.js';
import { tool as controlListTool } from './powerpipe_control_list.js';
import { tool as controlShowTool } from './powerpipe_control_show.js';
import { tool as controlRunTool } from './powerpipe_control_run.js';

// Secondary Operations
import { tool as detectionListTool } from './powerpipe_detection_list.js';
import { tool as detectionShowTool } from './powerpipe_detection_show.js';
import { tool as detectionRunTool } from './powerpipe_detection_run.js';
import { tool as queryListTool } from './powerpipe_query_list.js';
import { tool as queryShowTool } from './powerpipe_query_show.js';

// Configuration & Utilities
import { tool as modLocationTool } from './powerpipe_mod_location.js';
import { tool as modListTool } from './powerpipe_mod_list.js';
import { tool as variableListTool } from './powerpipe_variable_list.js';
import { tool as variableShowTool } from './powerpipe_variable_show.js';
import { tool as docsHclTool } from './powerpipe_docs_hcl.js';

// Powerpipe
import { tool as dashboard_list } from "./powerpipe_dashboard_list.js";
import { tool as dashboard_show } from "./powerpipe_dashboard_show.js";
import { tool as dashboard_run } from "./powerpipe_dashboard_run.js";

// Export all tools for server capabilities
export const tools = {
  // Most Frequently Used Operations
  powerpipe_benchmark_list: benchmarkListTool,    // Primary entry point for users finding benchmarks
  powerpipe_benchmark_show: benchmarkShowTool,    // Detailed benchmark info
  powerpipe_benchmark_run: benchmarkRunTool,      // Running benchmarks - core operation

  powerpipe_control_list: controlListTool,        // Finding available controls
  powerpipe_control_show: controlShowTool,        // Control details
  powerpipe_control_run: controlRunTool,          // Running controls - core operation

  // Secondary Operations
  powerpipe_detection_list: detectionListTool,    // Less commonly used than benchmarks/controls
  powerpipe_detection_show: detectionShowTool,
  powerpipe_detection_run: detectionRunTool,

  powerpipe_query_list: queryListTool,           // More technical/advanced usage
  powerpipe_query_show: queryShowTool,

  // Configuration & Utilities
  powerpipe_mod_location: modLocationTool,       // Usually set once and rarely changed
  powerpipe_mod_list: modListTool,              // List available mods
  powerpipe_variable_list: variableListTool,     // Supporting operations
  powerpipe_variable_show: variableShowTool,

  // Documentation
  powerpipe_docs_hcl: docsHclTool,               // HCL documentation lookup

  // Powerpipe
  powerpipe_dashboard_list: dashboard_list,
  powerpipe_dashboard_show: dashboard_show,
  powerpipe_dashboard_run: dashboard_run
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