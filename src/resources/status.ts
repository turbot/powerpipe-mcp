import type { ServerResult } from "@modelcontextprotocol/sdk/types.js";
import { executeCommand, type CommandError } from "../utils/command.js";
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
  
  // Get Powerpipe CLI version (when available)
  let powerpipeVersion = 'Not installed';
  try {
    const cmd = buildPowerpipeCommand('--version', '', {});
    const output = executeCommand(cmd);
    // Use a regex to extract the version number directly
    const versionMatch = output.trim().match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (versionMatch && versionMatch[1]) {
      powerpipeVersion = versionMatch[1];
    } else {
      logger.error('Unexpected powerpipe version output format:', output);
      powerpipeVersion = output.trim();
    }
  } catch (error) {
    // Command execution errors
    if (error instanceof Error && 'stderr' in error) {
      const cmdError = error as CommandError;
      const details = [
        cmdError.stderr && `Error: ${cmdError.stderr}`,
        cmdError.code && `Exit code: ${cmdError.code}`,
        cmdError.signal && `Signal: ${cmdError.signal}`,
        cmdError.cmd && `Command: ${cmdError.cmd}`
      ].filter(Boolean).join('\n');

      logger.error('Error getting powerpipe version:', details);
    } else {
      logger.error('Error getting powerpipe version:', error instanceof Error ? error.message : String(error));
    }
    powerpipeVersion = 'Not installed or failed to run';
  }
  
  // Prepare the status response
  const content = {
    powerpipe: {
      version: powerpipeVersion
    },
    mcp_server: {
      version: "0.1.0", // Matches the version in package.json
      start_time: new Date().toISOString()
    }
  };
  
  return {
    contents: [
      {
        uri: uri,
        mimeType: "application/json",
        text: JSON.stringify(content, null, 2)
      }
    ],
    _meta: {}
  };
}