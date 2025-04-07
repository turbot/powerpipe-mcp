import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";

export const tool: Tool = {
  name: "reset_mod_location",
  description: "Reset the mod location to default",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const success = config.resetModLocation();
    const location = config.getModLocation();
    return {
      content: [{
        type: "text",
        text: success ? `Reset mod location to: ${location}` : "Failed to reset mod location"
      }]
    };
  }
}; 