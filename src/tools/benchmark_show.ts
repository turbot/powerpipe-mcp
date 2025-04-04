import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";

export interface BenchmarkShowParams {
  qualified_name: string;
}

export const tool: Tool = {
  name: "benchmark_show",
  description: "Get detailed information about a specific Powerpipe benchmark",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the benchmark to show details for"
      }
    },
    required: ["qualified_name"]
  },
};

export async function handler({ qualified_name }: BenchmarkShowParams): Promise<{content: [{type: string, text: string}]}> {
  try {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModDirectory();
    const cmd = `powerpipe benchmark show ${qualified_name} --output json --mod-location "${modDirectory}"`;

    const env = {
      ...process.env,
      POWERPIPE_MOD_DIRECTORY: modDirectory
    };

    const output = execSync(cmd, { 
      encoding: 'utf-8',
      env
    });
    
    try {
      const benchmark = JSON.parse(output);
      
      const result = {
        benchmark,
        debug: {
          command: cmd
        }
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (parseError) {
      logger.error('Failed to parse Powerpipe CLI output:', parseError instanceof Error ? parseError.message : String(parseError));
      logger.error('Powerpipe output:', output);
      throw new Error(`Failed to parse Powerpipe CLI output: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    // If it's an error from execSync, it will have stdout and stderr properties
    if (error && typeof error === 'object' && 'stderr' in error) {
      const execError = error as { stderr: Buffer };
      const errorMessage = execError.stderr.toString();
      logger.error('Failed to run Powerpipe CLI:', errorMessage);
      throw new Error(`Failed to run Powerpipe CLI: ${errorMessage}`);
    }
    
    logger.error('Failed to run Powerpipe CLI:', error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to run Powerpipe CLI: ${error instanceof Error ? error.message : String(error)}`);
  }
} 