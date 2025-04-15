import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";

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
  description: "Run a specific Powerpipe dashboard",
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
    const cmd = buildPowerpipeCommand(`dashboard run ${params.qualified_name}`, modDirectory, { output: 'pps' });
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
          })
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 