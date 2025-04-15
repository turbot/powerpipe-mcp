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
  name: "powerpipe_query_show",
  description: "Displays the SQL implementation and metadata for a specific query used by controls and detections. Use this to examine exactly what data is being queried and how compliance determinations are made. Requires the query's qualified name from query list.",
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
          })
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 