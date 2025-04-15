import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface DetectionShowParams {
  qualified_name: string;
}

function validateParams(args: unknown): DetectionShowParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<DetectionShowParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as DetectionShowParams;
}

export const tool: Tool = {
  name: "powerpipe_detection_show",
  description: "Displays detailed information about a specific security detection, including its implementation, severity, and remediation guidance. Use this to understand what security issues a detection looks for and how to fix them if found. Requires the detection's qualified name from detection list.",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the detection to show details for"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`detection show ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const detection = JSON.parse(output);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            detection,
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