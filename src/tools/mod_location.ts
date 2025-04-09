import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { formatCommandError } from "../utils/command.js";
import * as path from 'path';
import * as fs from 'fs';

interface ModLocationParams {
  location?: string;
}

type ValidationResult = ModLocationParams | ReturnType<typeof formatCommandError>;

function validateParams(args: unknown): ValidationResult {
  if (!args || typeof args !== 'object') {
    return {}; // No args means "get" operation
  }

  const params = args as Partial<ModLocationParams>;
  if (params.location && typeof params.location !== 'string') {
    return formatCommandError(new Error("If provided, location must be a string"));
  }

  return params;
}

export const tool: Tool = {
  name: "mod_location",
  description: "Get or set the Powerpipe mod location",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The location to set. If not provided, returns current location"
      }
    },
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    if ('isError' in params) {
      return params;
    }

    const config = ConfigurationService.getInstance();

    // Get operation
    if (!params.location) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ location: config.getModLocation() }, null, 2)
        }]
      };
    }

    // Set operation
    const resolvedLocation = path.resolve(params.location);
    
    // Check if directory exists
    try {
      const stats = fs.statSync(resolvedLocation);
      if (!stats.isDirectory()) {
        return formatCommandError(new Error(`Path exists but is not a directory: ${resolvedLocation}`));
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return formatCommandError(new Error(`Directory does not exist: ${resolvedLocation}`));
      }
      // Other file system errors
      return formatCommandError(error);
    }

    if (!config.setModLocation(resolvedLocation)) {
      return formatCommandError(new Error(`Failed to set mod location to: ${resolvedLocation}`));
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ location: resolvedLocation }, null, 2)
      }]
    };
  }
}; 