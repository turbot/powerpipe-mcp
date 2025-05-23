import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError, formatResult } from "../utils/command.js";
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

export const tool: Tool = {
  name: "powerpipe_mod_list",
  description: "List all available Powerpipe mods. Use this to discover which mods are installed and get their qualified names.",
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
      return formatResult({ mods }, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 