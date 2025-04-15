import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatResult } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { handlePowerpipeRunOutput } from "../utils/powerpipe_run.js";
import { logger } from "../services/logger.js";

interface BenchmarkRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): BenchmarkRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<BenchmarkRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as BenchmarkRunParams;
}

export const tool: Tool = {
  name: "powerpipe_benchmark_run",
  description: "Executes all controls in a compliance benchmark to evaluate your infrastructure against the framework's requirements. Each control will run its associated queries and report compliance status. Use benchmark show first to understand what will be evaluated.",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the benchmark to run"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`benchmark run ${params.qualified_name}`, modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const result = JSON.parse(output);
      return formatResult({ result }, cmd);
    } catch (error) {
      return handlePowerpipeRunOutput(error, cmd);
    }
  }
}; 