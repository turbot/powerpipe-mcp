import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError, CommandError } from "../utils/command.js";
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
  name: "powerpipe_detection_run",
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
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            output: JSON.parse(output),
            debug: {
              command: cmd
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      // If we have stdout, return it as valid output even if command failed
      if (error instanceof Error && 'stdout' in error) {
        const cmdError = error as CommandError;
        if (cmdError.stdout) {
          try {
            // Validate it's JSON
            const parsed = JSON.parse(cmdError.stdout);
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  output: parsed,
                  debug: {
                    command: cmd
                  }
                }, null, 2)
              }]
            };
          } catch (parseError) {
            logger.error('Failed to parse detection output:', parseError);
          }
        }
      }
      return formatCommandError(error, cmd);
    }
  }
}; 