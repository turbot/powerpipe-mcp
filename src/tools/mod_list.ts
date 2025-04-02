import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";

export const tool: Tool = {
  name: "mod_list",
  description: "List all available Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

export async function handler(): Promise<{result: {mods: unknown[]}}> {
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