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
  name: "powerpipe_mod_location",
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
          text: JSON.stringify({ location: config.getModLocation() })
        }]
      };
    }

    // Set operation
    const result = config.setModLocation(params.location);
    if (!result.success) {
      return formatCommandError(new Error(result.error || `Failed to set mod location to: ${params.location}`));
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ location: config.getModLocation() })
      }]
    };
  }
}; 