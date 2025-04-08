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
export async function handleStatusResource(uri: string): Promise<ResourceResponse | null> {
  // Check if this is a status resource URI
  if (uri !== 'powerpipe://status') {
    return null;
  }
  
  try {
    const cmd = buildPowerpipeCommand('--version', '');
    const output = executeCommand(cmd);
    
    // Version output is not JSON, so we need to parse it manually
    const versionMatch = output.trim().match(/v?(\d+\.\d+(\.\d+)?)/i);
    const version = versionMatch ? versionMatch[1] : output.trim();

    return {
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify({
          powerpipe: {
            version
          },
          server: {
            version: process.env.MCP_SERVER_VERSION || 'unknown',
            startTime: process.env.MCP_SERVER_START_TIME || 'unknown'
          }
        }, null, 2)
      }],
      _meta: {}
    };
  } catch (error) {
    throw formatCommandError(error);
  }
}