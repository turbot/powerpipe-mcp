import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";

export const MOD_LIST_TOOL: Tool = {
  name: "mcp_powerpipe_mod_list",
  description: "List all available Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {
      random_string: {
        type: "string",
        description: "Dummy parameter for no-parameter tools",
      },
    },
    required: ["random_string"],
  },
};

export async function handleModListTool(): Promise<{result: {mods: unknown[]}}> {
  try {
    logger.info('Getting mod list from Powerpipe CLI...');
    const output = execSync('powerpipe mod list --output json', { encoding: 'utf-8' });
    
    try {
      const result = JSON.parse(output);
      return {
        result: {
          mods: result.mods || [],
        },
      };
    } catch (parseError) {
      logger.error('Failed to parse Powerpipe CLI output:', parseError instanceof Error ? parseError.message : String(parseError));
      logger.error('Powerpipe output:', output);
      throw new Error('Failed to parse Powerpipe CLI output');
    }
  } catch (error) {
    logger.error('Failed to run Powerpipe CLI:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to get mod list from Powerpipe CLI');
  }
} 