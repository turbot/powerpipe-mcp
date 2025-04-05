import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";

interface Control {
  title: string;
  qualified_name: string;
  documentation: string;
  tags: Record<string, string>;
}

export const tool: Tool = {
  name: "control_list",
  description: "List all available Powerpipe controls",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModDirectory();
    const cmd = `powerpipe control list --output json --mod-location "${modDirectory}"`;

    try {
      const env = {
        ...process.env,
        POWERPIPE_MOD_DIRECTORY: modDirectory
      };

      const output = execSync(cmd, { 
        encoding: 'utf-8',
        env
      });
      
      try {
        const rawControls = JSON.parse(output);
        if (!Array.isArray(rawControls)) {
          throw new Error('Expected array output from Powerpipe CLI');
        }

        // Filter to only include specified fields
        const controls = rawControls.map(control => ({
          title: control.title || '',
          qualified_name: control.qualified_name || '',
          documentation: control.documentation || '',
          tags: typeof control.tags === 'object' && control.tags !== null ? control.tags : {}
        }));

        const result = {
          controls,
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
        throw new Error(`Failed to parse Powerpipe CLI output: ${parseError instanceof Error ? parseError.message : String(parseError)}. Command: ${cmd}`);
      }
    } catch (error) {
      // If it's an error from execSync, it will have stdout and stderr properties
      if (error && typeof error === 'object' && 'stderr' in error) {
        const execError = error as { stderr: Buffer };
        const errorMessage = execError.stderr.toString().trim();
        
        // If stderr is empty but we have stdout, try to parse stdout
        if (!errorMessage && 'stdout' in error && error.stdout) {
          try {
            const stdout = error.stdout.toString();
            const rawControls = JSON.parse(stdout);
            if (Array.isArray(rawControls)) {
              const controls = rawControls.map(control => ({
                title: control.title || '',
                qualified_name: control.qualified_name || '',
                documentation: control.documentation || '',
                tags: typeof control.tags === 'object' && control.tags !== null ? control.tags : {}
              }));

              const result = {
                controls,
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
            }
          } catch (parseError) {
            logger.error('Failed to parse Powerpipe CLI stdout:', parseError instanceof Error ? parseError.message : String(parseError));
            throw new Error(`Failed to parse Powerpipe CLI stdout: ${parseError instanceof Error ? parseError.message : String(parseError)}. Command: ${cmd}`);
          }
        }

        logger.error('Failed to run Powerpipe CLI:', errorMessage);
        throw new Error(`Failed to run Powerpipe CLI: ${errorMessage}. Command: ${cmd}`);
      }
      
      // For other types of errors, include the error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to run Powerpipe CLI:', errorMessage);
      throw new Error(`Failed to run Powerpipe CLI: ${errorMessage}. Command: ${cmd}`);
    }
  }
}; 