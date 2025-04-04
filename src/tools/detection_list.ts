import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";

interface Detection {
  title: string;
  qualified_name: string;
  documentation: string;
}

export const tool: Tool = {
  name: "detection_list",
  description: "List all available Powerpipe detections",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    try {
      const config = ConfigurationService.getInstance();
      const modDirectory = config.getModDirectory();
      const cmd = `powerpipe detection list --output json --mod-location "${modDirectory}"`;

      const env = {
        ...process.env,
        POWERPIPE_MOD_DIRECTORY: modDirectory
      };

      const output = execSync(cmd, { 
        encoding: 'utf-8',
        env
      });
      
      try {
        const rawDetections = JSON.parse(output);
        if (!Array.isArray(rawDetections)) {
          throw new Error('Expected array output from Powerpipe CLI');
        }

        // Filter to only include specified fields
        const detections = rawDetections.map(detection => ({
          title: detection.title || '',
          qualified_name: detection.qualified_name || '',
          documentation: detection.documentation || ''
        }));

        const result = {
          detections,
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
}; 