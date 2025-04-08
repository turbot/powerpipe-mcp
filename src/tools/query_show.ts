import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface QueryShowParams {
  qualified_name: string;
}

function validateParams(args: unknown): QueryShowParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<QueryShowParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as QueryShowParams;
}

export const tool: Tool = {
  name: "query_show",
  description: "Get detailed information about a specific Powerpipe query",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the query to show details for"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`query show ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const query = JSON.parse(output);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            query,
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