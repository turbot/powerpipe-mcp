import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { handlePowerpipeRunOutput } from "../utils/powerpipe_run.js";
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
  description: "Executes a specific security detection to identify potential security issues or compliance violations in your infrastructure. Each detection focuses on a particular security concern and provides actionable results. Use detection show first to understand what will be checked.",
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
          })
        }]
      };
    } catch (error) {
      return handlePowerpipeRunOutput(error, cmd);
    }
  }
}; 