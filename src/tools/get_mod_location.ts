import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";

export const tool: Tool = {
  name: "get_mod_location",
  description: "Get the current mod location",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const location = config.getModLocation();
    return {
      content: [{
        type: "text",
        text: location
      }]
    };
  }
}; 