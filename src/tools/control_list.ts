import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, CommandError } from "../utils/command.js";

interface Control {
  title: string;
  qualified_name: string;
  documentation: string;
  tags: Record<string, string>;
}

function parseControls(output: string): Control[] {
  const rawControls = JSON.parse(output);
  if (!Array.isArray(rawControls)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawControls.map(control => ({
    title: control.title || '',
    qualified_name: control.qualified_name || '',
    documentation: control.documentation || '',
    tags: typeof control.tags === 'object' && control.tags !== null ? control.tags : {}
  }));
}

function formatResult(controls: Control[], cmd: string) {
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

    const env = {
      ...process.env,
      POWERPIPE_MOD_LOCATION: modDirectory
    };

    try {
      const output = executeCommand(cmd, { env });
      const controls = parseControls(output);
      return formatResult(controls, cmd);
    } catch (error) {
      // JSON parsing errors
      if (error instanceof SyntaxError) {
        logger.error('Failed to parse Powerpipe CLI output:', error.message);
        throw new Error(`Failed to parse Powerpipe CLI output: ${error.message}. Command: ${cmd}`);
      }

      // Command execution errors
      if (error instanceof Error && 'stderr' in error) {
        const cmdError = error as CommandError;
        const details = [
          cmdError.stderr && `Error: ${cmdError.stderr}`,
          cmdError.code && `Exit code: ${cmdError.code}`,
          cmdError.signal && `Signal: ${cmdError.signal}`,
          cmdError.cmd && `Command: ${cmdError.cmd}`
        ].filter(Boolean).join('\n');

        throw new Error(`Failed to run Powerpipe CLI:\n${details}`);
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}; 