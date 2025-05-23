import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError, formatResult } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface BenchmarkShowParams {
  qualified_name: string;
}

function validateParams(args: unknown): BenchmarkShowParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<BenchmarkShowParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as BenchmarkShowParams;
}

export const tool: Tool = {
  name: "powerpipe_benchmark_show",
  description: "Displays detailed information about a specific compliance benchmark, including its controls, tags, and documentation. Use this to understand the scope and requirements of a compliance framework before running it. Requires the benchmark's qualified name from benchmark list.",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the benchmark to show details for"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`benchmark show ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const benchmark = JSON.parse(output);
      return formatResult({ benchmark }, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 