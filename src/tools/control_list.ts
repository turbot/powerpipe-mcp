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

interface RawControl {
  title?: string;
  qualified_name?: string;
  documentation?: string;
  tags?: unknown;
}

function parseControls(jsonStr: string): Control[] {
  const rawControls = JSON.parse(jsonStr);
  if (!Array.isArray(rawControls)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  return rawControls.map((control: RawControl) => ({
    title: control.title || '',
    qualified_name: control.qualified_name || '',
    documentation: control.documentation || '',
    tags: typeof control.tags === 'object' && control.tags !== null ? control.tags as Record<string, string> : {}
  }));
}

function formatResult(controls: Control[], cmd: string) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        controls,
        debug: { command: cmd }
      }, null, 2)
    }]
  };
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

      // Try to get output from the command
      const output = execSync(cmd, { 
        encoding: 'utf-8',
        env,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // Parse the successful output
      const controls = parseControls(output);
      return formatResult(controls, cmd);

    } catch (error) {
      // Handle execSync errors
      if (error && typeof error === 'object' && 'stderr' in error) {
        const execError = error as { stderr: Buffer; stdout?: Buffer };
        const stderr = execError.stderr.toString().trim();
        
        // If stderr is empty but stdout exists, try to parse stdout
        if (!stderr && execError.stdout) {
          try {
            const controls = parseControls(execError.stdout.toString());
            return formatResult(controls, cmd);
          } catch (parseError) {
            logger.error('Failed to parse Powerpipe CLI stdout:', parseError instanceof Error ? parseError.message : String(parseError));
            throw new Error(`Failed to parse Powerpipe CLI stdout: ${parseError instanceof Error ? parseError.message : String(parseError)}. Command: ${cmd}`);
          }
        }

        // Real stderr error
        logger.error('Failed to run Powerpipe CLI:', stderr);
        throw new Error(`Failed to run Powerpipe CLI: ${stderr}. Command: ${cmd}`);
      }

      // JSON parsing or other errors
      if (error instanceof SyntaxError) {
        logger.error('Failed to parse Powerpipe CLI output:', error.message);
        throw new Error(`Failed to parse Powerpipe CLI output: ${error.message}. Command: ${cmd}`);
      }
      
      // Unknown errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to run Powerpipe CLI:', errorMessage);
      throw new Error(`Failed to run Powerpipe CLI: ${errorMessage}. Command: ${cmd}`);
    }
  }
}; 