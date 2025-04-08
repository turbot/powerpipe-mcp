import type { ServerResult } from "@modelcontextprotocol/sdk/types.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

interface ResourceResponse {
  contents: ResourceContent[];
  _meta?: Record<string, unknown>;
}

// Define a function to handle status resource requests
export async function handleStatusResource(uri: string): Promise<ServerResult | null> {
  // Check if this is a status resource URI
  if (uri !== 'powerpipe://status') {
    return null;
  }
  
  try {
    const cmd = buildPowerpipeCommand('version', '', { output: 'json' });
    const output = executeCommand(cmd);
    const version = JSON.parse(output);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          version,
          server: {
            version: process.env.MCP_SERVER_VERSION || 'unknown',
            startTime: process.env.MCP_SERVER_START_TIME || 'unknown'
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw formatCommandError(error);
  }
}