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

function validateParams(args: unknown): SetModDirectoryParams {
  if (!args || typeof args !== 'object' || !('directory' in args) || typeof args.directory !== 'string') {
    throw new Error('Invalid arguments for set_mod_directory - requires {directory: string}');
  }
  return { directory: args.directory };
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
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const resolvedDirectory = resolvePath(params.directory);

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
      content: [{
        type: "text",
        text: JSON.stringify({
          directory: resolvedDirectory,
          message: `Successfully set mod directory to: ${resolvedDirectory}`
        }, null, 2)
      }]
    };
  }
}; 