import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError, formatResult } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface Dashboard {
  title: string;
  qualified_name: string;
  documentation: string;
}

function parseDashboards(output: string): Dashboard[] {
  const rawDashboards = JSON.parse(output);
  if (!Array.isArray(rawDashboards)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawDashboards.map(dashboard => ({
    title: dashboard.title || '',
    qualified_name: dashboard.qualified_name || '',
    documentation: dashboard.documentation || ''
  }));
}

export const tool: Tool = {
  name: "powerpipe_dashboard_list",
  description: "List all available dashboards. Use this to discover which compliance and security insights are available.",
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
      const dashboards = parseDashboards(output);
      return formatResult({ dashboards }, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 