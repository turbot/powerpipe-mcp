import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolRequest, type Tool, type ServerResult } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../services/logger.js";
import { formatCommandError } from "../utils/command.js";
import type { ErrorObject } from "ajv";
import AjvModule from "ajv";

// Initialize JSON Schema validator
const Ajv = AjvModule.default || AjvModule;
const ajv = new Ajv();

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
    try {
      return {
        tools: Object.values(tools),
      };
    } catch (error) {
      logger.error('Error listing tools:', error);
      return formatCommandError(error);
    }
  });

  // Register tool handlers
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;
    
    try {
      // Validate tool exists
      const tool = tools[name as keyof typeof tools];
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      // Validate tool has handler
      if (!tool.handler) {
        throw new Error(`Tool ${name} has no handler defined`);
      }

      // Validate arguments against the tool's schema
      if (tool.inputSchema) {
        const validate = ajv.compile(tool.inputSchema);
        if (!validate(args)) {
          logger.error(`Invalid arguments for tool ${name}:`, validate.errors);
          
          // Format validation errors in a user-friendly way
          const errors = validate.errors || [];
          const errorMessages = errors.map((err: ErrorObject) => {
            const path = err.instancePath.replace(/^\//, '') || 'input';
            switch (err.keyword) {
              case 'required':
                return `Missing required field: ${err.params.missingProperty}`;
              case 'type':
                return `${path} must be a ${err.params.type}`;
              case 'enum':
                return `${path} must be one of: ${err.params.allowedValues?.join(', ')}`;
              case 'additionalProperties':
                return `Unexpected field: ${err.params.additionalProperty}`;
              default:
                return `${path}: ${err.message}`;
            }
          });

          return {
            content: [{
              type: "text",
              text: errorMessages.join('\n')
            }],
            isError: true
          };
        }
      }

      // Log tool invocation
      logger.info(`Executing tool: ${name}`, { args });

      // Execute tool handler with validated arguments
      const result = await (tool.handler as (args: unknown) => Promise<ServerResult>)(args || {});
      
      // Log tool completion
      logger.info(`Tool ${name} completed successfully`);
      
      return result;
    } catch (error) {
      // Log error
      logger.error(`Error executing tool ${name}:`, error);
      
      // Format and return error
      return formatCommandError(error);
    }
  });
} 