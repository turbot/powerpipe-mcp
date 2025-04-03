import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";

export const tool: Tool = {
  name: "get_mod_directory",
  description: "Get the current working directory for Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const directory = config.getModDirectory();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          directory,
          message: `Current mod directory: ${directory}`
        }, null, 2)
      }]
    };
  }
}; 