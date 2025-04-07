import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand } from "../utils/command.js";

interface Mod {
  title: string;
  qualified_name: string;
  documentation: string;
}

function parseMods(output: string): Mod[] {
  const rawMods = JSON.parse(output);
  if (!Array.isArray(rawMods)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawMods.map(mod => ({
    title: mod.title || '',
    qualified_name: mod.qualified_name || '',
    documentation: mod.documentation || ''
  }));
}

function formatResult(mods: Mod[], cmd: string) {
  const result = {
    mods,
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
  name: "mod_list",
  description: "List all available Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = `powerpipe mod list --output json --mod-location "${modDirectory}"`;

    const env = {
      ...process.env,
      POWERPIPE_MOD_LOCATION: modDirectory
    };

    try {
      const output = executeCommand(cmd, { env });
      const mods = parseMods(output);
      return formatResult(mods, cmd);
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