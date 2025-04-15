import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatResult } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { handlePowerpipeRunOutput } from "../utils/powerpipe_run.js";
import { logger } from "../services/logger.js";

interface DashboardRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): DashboardRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<DashboardRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as DashboardRunParams;
}

export const tool: Tool = {
  name: "powerpipe_dashboard_run",
  description: "Executes a dashboard to get a JSON snapshot of your compliance and security status. Use dashboard show first to understand what will be included.",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the dashboard to run"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`dashboard run ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const result = JSON.parse(output);
      return formatResult({ result }, cmd);
    } catch (error) {
      return handlePowerpipeRunOutput(error, cmd);
    }
  }
}; 