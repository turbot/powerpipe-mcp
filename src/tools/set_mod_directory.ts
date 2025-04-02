import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { logger } from "../services/logger.js";

export interface SetModDirectoryParams {
  directory: string;
}

function resolvePath(path: string): string {
  // Handle ~ for home directory
  if (path.startsWith('~')) {
    path = path.replace('~', homedir());
  }
  // Resolve to absolute path
  return resolve(path);
}

export const tool: Tool = {
  name: "set_mod_directory",
  description: "Set the working directory for Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {
      directory: {
        type: "string",
        description: "The path to the directory containing Powerpipe mods"
      }
    },
    required: ["directory"]
  },
  handler: async ({ directory }: SetModDirectoryParams) => {
    const resolvedDirectory = resolvePath(directory);

    // Validate directory exists
    if (!existsSync(resolvedDirectory)) {
      logger.error(`Directory does not exist: ${resolvedDirectory}`);
      throw new Error(`Directory does not exist: ${resolvedDirectory}`);
    }

    const config = ConfigurationService.getInstance();
    const success = config.setModDirectory(resolvedDirectory);
    
    if (!success) {
      logger.error(`Failed to set mod directory to: ${resolvedDirectory}`);
      throw new Error(`Failed to set mod directory to: ${resolvedDirectory}`);
    }

    return {
      type: "text",
      text: `Successfully set mod directory to: ${resolvedDirectory}`
    };
  }
}; 