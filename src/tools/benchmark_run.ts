import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand } from "../utils/command.js";

export interface BenchmarkRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): BenchmarkRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments');
  }

  const params = args as Partial<BenchmarkRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as BenchmarkRunParams;
}

export const tool: Tool = {
  name: "benchmark_run",
  description: "Run a specific Powerpipe benchmark",
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
    const modDirectory = config.getModDirectory();
    const cmd = `powerpipe benchmark run ${params.qualified_name} --output json --mod-location "${modDirectory}"`;

    const env = {
      ...process.env,
      POWERPIPE_MOD_DIRECTORY: modDirectory
    };

    try {
      const output = executeCommand(cmd, { env });
      const result = JSON.parse(output);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            result,
            debug: {
              command: cmd
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      // JSON parsing errors
      if (error instanceof SyntaxError) {
        logger.error('Failed to parse Powerpipe CLI output:', error.message);
        throw new Error(`Failed to parse Powerpipe CLI output: ${error.message}. Command: ${cmd}`);
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}; 