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
      const directory = config.getModDirectory();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            directory,
            message: `Successfully reset mod directory to default: ${directory}`
          }, null, 2)
        }]
      };
    } else {
      throw new Error("Failed to reset mod directory");
    }
  }
}; 