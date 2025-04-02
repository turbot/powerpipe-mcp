import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";

export const tool: Tool = {
  name: "reset_mod_directory",
  description: "Reset the working directory to the default value",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const success = config.resetModDirectory();
    
    if (success) {
      return {
        type: "text",
        text: `Successfully reset mod directory to default`
      };
    } else {
      return {
        type: "error",
        text: "Failed to reset mod directory"
      };
    }
  }
}; 