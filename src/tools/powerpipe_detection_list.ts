import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError, formatResult } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface Detection {
  title: string;
  qualified_name: string;
  documentation: string;
}

function parseDetections(output: string): Detection[] {
  const rawDetections = JSON.parse(output);
  if (!Array.isArray(rawDetections)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawDetections.map(detection => ({
    title: detection.title || '',
    qualified_name: detection.qualified_name || '',
    documentation: detection.documentation || ''
  }));
}

export const tool: Tool = {
  name: "powerpipe_detection_list",
  description: "List all available security detections. Use this to discover potential security issues that can be identified in your infrastructure.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand('detection list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const detections = parseDetections(output);
      return formatResult({ detections }, cmd);
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 