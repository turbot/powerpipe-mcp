import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface ControlRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): ControlRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<ControlRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as ControlRunParams;
}

export const tool: Tool = {
  name: "control_run",
  description: "Run a Powerpipe control by its qualified name",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the control to run"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`control run ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const result = JSON.parse(output);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            result,
            debug: {
              command: cmd
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      throw formatCommandError(error, cmd);
    }
  }
}; 