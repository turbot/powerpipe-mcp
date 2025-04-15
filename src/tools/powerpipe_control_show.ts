import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface ControlShowParams {
  qualified_name: string;
}

function validateParams(args: unknown): ControlShowParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<ControlShowParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as ControlShowParams;
}

export const tool: Tool = {
  name: "powerpipe_control_show",
  description: "Displays detailed information about a specific compliance control, including its implementation details, associated queries, and documentation. Use this to understand exactly how a control evaluates compliance and what data it examines. Requires the control's qualified name from control list.",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the control to show details for"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`control show ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const control = JSON.parse(output);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            control,
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