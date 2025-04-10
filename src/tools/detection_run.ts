import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface DetectionRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): DetectionRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<DetectionRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as DetectionRunParams;
}

export const tool: Tool = {
  name: "detection_run",
  description: "Run a specific Powerpipe detection",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the detection to run"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`detection run ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      
      // Try to parse the JSON to validate it
      try {
        JSON.parse(output);
      } catch (parseError) {
        logger.error('Failed to parse detection output:', parseError);
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Invalid JSON output from detection run:\n${output}`
          }]
        };
      }

      // If JSON is valid, return it directly
      return {
        content: [{
          type: "text",
          text: output
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 