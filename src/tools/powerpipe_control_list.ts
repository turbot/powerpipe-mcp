import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

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
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        controls,
        debug: {
          command: cmd
        }
      }, null, 2)
    }]
  };
}

export const tool: Tool = {
  name: "powerpipe_control_list",
  description: "List all available Powerpipe controls",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand('control list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const controls = parseControls(output);
      return formatResult(controls, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 