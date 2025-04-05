import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand } from "../utils/command.js";

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

function formatResult(detections: Detection[], cmd: string) {
  const result = {
    detections,
    debug: {
      command: cmd
    }
  };

  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }]
  };
}

export const tool: Tool = {
  name: "detection_list",
  description: "List all available Powerpipe detections",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModDirectory();
    const cmd = `powerpipe detection list --output json --mod-location "${modDirectory}"`;

    const env = {
      ...process.env,
      POWERPIPE_MOD_DIRECTORY: modDirectory
    };

    try {
      const output = executeCommand(cmd, { env });
      const detections = parseDetections(output);
      return formatResult(detections, cmd);
    } catch (error) {
      // JSON parsing errors
      if (error instanceof SyntaxError) {
        logger.error('Failed to parse Powerpipe CLI output:', error.message);
        throw new Error(`Failed to parse Powerpipe CLI output: ${error.message}. Command: ${cmd}`);
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}; 