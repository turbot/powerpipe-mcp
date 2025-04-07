import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import * as path from 'path';

interface ModLocationParams {
  location?: string;
}

function validateParams(args: unknown): ModLocationParams {
  if (!args || typeof args !== 'object') {
    return {}; // No args means "get" operation
  }

  const params = args as Partial<ModLocationParams>;
  if (params.location && typeof params.location !== 'string') {
    throw new Error("If provided, location must be a string");
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
    if (!config.setModLocation(resolvedLocation)) {
      throw new Error(`Failed to set mod location to: ${resolvedLocation}`);
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ location: resolvedLocation }, null, 2)
      }]
    };
  }
}; 