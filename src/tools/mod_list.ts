import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

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
    const cmd = buildPowerpipeCommand('mod list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const mods = parseMods(output);
      return formatResult(mods, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 