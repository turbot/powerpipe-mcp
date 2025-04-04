import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";

export interface ControlRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): ControlRunParams {
  if (!args || typeof args !== 'object' || !('qualified_name' in args) || typeof args.qualified_name !== 'string') {
    throw new Error('Invalid arguments for control_run - requires {qualified_name: string}');
  }
  return { qualified_name: args.qualified_name };
}

export const tool: Tool = {
  name: "control_run",
  description: "Run a specific Powerpipe control",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the control to run"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    try {
      const config = ConfigurationService.getInstance();
      const modDirectory = config.getModDirectory();
      const cmd = `powerpipe control run ${params.qualified_name} --output json --mod-location "${modDirectory}"`;

      const env = {
        ...process.env,
        POWERPIPE_MOD_DIRECTORY: modDirectory
      };

      const output = execSync(cmd, { 
        encoding: 'utf-8',
        env
      });
      
      try {
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
}; 