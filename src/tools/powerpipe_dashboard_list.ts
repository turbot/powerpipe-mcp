import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";

export const tool: Tool = {
  name: "powerpipe_dashboard_list",
  description: "List all available Powerpipe dashboards",
  inputSchema: {
    type: "object",
    properties: {
      random_string: {
        type: "string",
        description: "Dummy parameter for no-parameter tools"
      }
    },
    required: ["random_string"]
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand('dashboard list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const dashboards = JSON.parse(output);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            dashboards,
            debug: {
              command: cmd
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 