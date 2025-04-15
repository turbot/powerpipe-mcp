import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError, formatResult } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface Variable {
  title: string;
  qualified_name: string;
  documentation: string;
}

function parseVariables(output: string): Variable[] {
  const rawVariables = JSON.parse(output);
  if (!Array.isArray(rawVariables)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawVariables.map(variable => ({
    title: variable.title || '',
    qualified_name: variable.qualified_name || '',
    documentation: variable.documentation || ''
  }));
}

export const tool: Tool = {
  name: "powerpipe_variable_list",
  description: "List all available configuration variables. Use this to discover which aspects of your compliance checks can be customized.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand('variable list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const variables = parseVariables(output);
      return formatResult({ variables }, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 