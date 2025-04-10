import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";

interface DashboardRunParams {
  qualified_name: string;
  output?: 'snapshot' | 'pps' | 'none';
  progress?: boolean;
  input?: boolean;
  max_parallel?: number;
  query_timeout?: number;
  dashboard_timeout?: number;
  var?: string[];
  var_file?: string[];
  arg?: string[];
}

function validateParams(args: unknown): DashboardRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<DashboardRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  // Validate optional parameters
  if (params.output !== undefined && !['snapshot', 'pps', 'none'].includes(params.output)) {
    throw new Error('output must be one of: snapshot, pps, none');
  }
  if (params.progress !== undefined && typeof params.progress !== 'boolean') {
    throw new Error('progress must be a boolean');
  }
  if (params.input !== undefined && typeof params.input !== 'boolean') {
    throw new Error('input must be a boolean');
  }
  if (params.max_parallel !== undefined && (!Number.isInteger(params.max_parallel) || params.max_parallel <= 0)) {
    throw new Error('max_parallel must be a positive integer');
  }
  if (params.query_timeout !== undefined && (!Number.isInteger(params.query_timeout) || params.query_timeout <= 0)) {
    throw new Error('query_timeout must be a positive integer');
  }
  if (params.dashboard_timeout !== undefined && (!Number.isInteger(params.dashboard_timeout) || params.dashboard_timeout <= 0)) {
    throw new Error('dashboard_timeout must be a positive integer');
  }
  if (params.var !== undefined && (!Array.isArray(params.var) || !params.var.every(v => typeof v === 'string'))) {
    throw new Error('var must be an array of strings');
  }
  if (params.var_file !== undefined && (!Array.isArray(params.var_file) || !params.var_file.every(v => typeof v === 'string'))) {
    throw new Error('var_file must be an array of strings');
  }
  if (params.arg !== undefined && (!Array.isArray(params.arg) || !params.arg.every(v => typeof v === 'string'))) {
    throw new Error('arg must be an array of strings');
  }

  return params as DashboardRunParams;
}

export const tool: Tool = {
  name: "dashboard_run",
  description: "Run a specific Powerpipe dashboard",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the dashboard to run"
      },
      output: {
        type: "string",
        enum: ["snapshot", "pps", "none"],
        description: "Output format (default: pps)"
      },
      progress: {
        type: "boolean",
        description: "Display dashboard execution progress (default: true)"
      },
      input: {
        type: "boolean",
        description: "Enable interactive prompts (default: true)"
      },
      max_parallel: {
        type: "integer",
        description: "Maximum number of concurrent database connections (default: 10)"
      },
      query_timeout: {
        type: "integer",
        description: "Query timeout in seconds (default: 300)"
      },
      dashboard_timeout: {
        type: "integer",
        description: "Dashboard execution timeout in seconds"
      },
      var: {
        type: "array",
        items: { type: "string" },
        description: "Variable values in format name=value"
      },
      var_file: {
        type: "array",
        items: { type: "string" },
        description: "Paths to .ppvar files containing variable values"
      },
      arg: {
        type: "array",
        items: { type: "string" },
        description: "Dashboard argument values in format name=value"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();

    // Build command with all options
    const cmdParts = ['dashboard', 'run'];
    
    // Add optional flags
    if (params.output) cmdParts.push(`--output=${params.output}`);
    if (params.progress !== undefined) cmdParts.push(`--progress=${params.progress}`);
    if (params.input !== undefined) cmdParts.push(`--input=${params.input}`);
    if (params.max_parallel) cmdParts.push(`--max-parallel=${params.max_parallel}`);
    if (params.query_timeout) cmdParts.push(`--query-timeout=${params.query_timeout}`);
    if (params.dashboard_timeout) cmdParts.push(`--dashboard-timeout=${params.dashboard_timeout}`);
    if (params.var) params.var.forEach(v => cmdParts.push(`--var=${v}`));
    if (params.var_file) params.var_file.forEach(v => cmdParts.push(`--var-file=${v}`));
    if (params.arg) params.arg.forEach(v => cmdParts.push(`--arg=${v}`));

    // Add dashboard name
    cmdParts.push(params.qualified_name);

    const cmd = buildPowerpipeCommand(cmdParts.join(' '), modDirectory);
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            output,
            debug: {
              command: cmd
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 