import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";

export const tool: Tool = {
  name: "powerpipe_dashboard_list",
  description: "Lists all available dashboards in your configured mod directory. Dashboards provide visual representations of your compliance and security status, combining multiple controls and queries into meaningful displays. Use this to find dashboards that give you insights into your compliance posture.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
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
          })
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 