import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import * as path from 'path';

interface SetModLocationParams {
  location: string;
}

function validateParams(args: unknown): SetModLocationParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments');
  }

  const params = args as Partial<SetModLocationParams>;
  if (!params.location || typeof params.location !== 'string') {
    throw new Error('location is required and must be a string');
  }

  return params as SetModLocationParams;
}

export const tool: Tool = {
  name: "set_mod_location",
  description: "Set the mod location",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The location to set for Powerpipe mods"
      }
    },
    required: ["location"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);

    // Resolve the path to handle relative paths
    const resolvedLocation = path.resolve(params.location);

    // Check if the directory exists
    try {
      const config = ConfigurationService.getInstance();
      const success = config.setModLocation(resolvedLocation);

      if (success) {
        const location = config.getModLocation();
        return {
          content: [{
            type: "text",
            text: `Set mod location to: ${location}`
          }]
        };
      } else {
        throw new Error("Failed to set mod location");
      }
    } catch (error) {
      throw new Error(`Failed to set mod location: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}; 