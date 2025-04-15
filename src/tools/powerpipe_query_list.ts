import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface Query {
  title: string;
  qualified_name: string;
  documentation: string;
}

function parseQueries(output: string): Query[] {
  const rawQueries = JSON.parse(output);
  if (!Array.isArray(rawQueries)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawQueries.map(query => ({
    title: query.title || '',
    qualified_name: query.qualified_name || '',
    documentation: query.documentation || ''
  }));
}

function formatResult(queries: Query[], cmd: string) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        queries,
        debug: {
          command: cmd
        }
      })
    }]
  };
}

export const tool: Tool = {
  name: "powerpipe_query_list",
  description: "Lists all available SQL queries that power the controls and detections in your configured mod directory. Queries are the foundation of how Powerpipe evaluates your infrastructure. Use this to understand the underlying implementation of controls and detections.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand('query list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const queries = parseQueries(output);
      return formatResult(queries, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 