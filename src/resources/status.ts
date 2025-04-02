import { execSync } from "node:child_process";
import { logger } from '../services/logger.js';

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
  
  // Get Powerpipe CLI version (when available)
  let powerpipeVersion = 'Not installed';
  try {
    // Using 'powerpipe --version'
    const output = execSync('powerpipe --version', { encoding: 'utf-8' });
    // Use a regex to extract the version number directly
    const versionMatch = output.trim().match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (versionMatch && versionMatch[1]) {
      powerpipeVersion = versionMatch[1];
    } else {
      logger.error('Unexpected powerpipe version output format:', output);
      powerpipeVersion = output.trim();
    }
  } catch (err) {
    // Powerpipe CLI is not installed or failed to run
    logger.error('Error getting powerpipe version:', err instanceof Error ? err.message : String(err));
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