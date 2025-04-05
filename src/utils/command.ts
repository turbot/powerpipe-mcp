import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";

export interface CommandOptions {
  env?: NodeJS.ProcessEnv;
  maxBuffer?: number;
}

export interface CommandError extends Error {
  stdout?: string;
  stderr?: string;
  cmd?: string;
  code?: number | string;
  signal?: string;
}

// Increase default buffer size to handle larger outputs
// 100MB buffer (increased from 10MB)
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

// Export the constant so it can be configured if needed
export const MAX_BUFFER_SIZE = process.env.MCP_MAX_BUFFER_SIZE 
  ? parseInt(process.env.MCP_MAX_BUFFER_SIZE, 10) 
  : DEFAULT_MAX_BUFFER;

export function executeCommand(cmd: string, options: CommandOptions = {}) {
  try {
    const execOptions = {
      encoding: 'utf-8' as const,
      env: options.env || process.env,
      maxBuffer: options.maxBuffer || MAX_BUFFER_SIZE
    };

    const output = execSync(cmd, execOptions);
    return output;
  } catch (error) {
    // If it's an error from execSync, it will have stdout and stderr properties
    if (error && typeof error === 'object') {
      const execError = error as { stderr?: Buffer; stdout?: Buffer; code?: number | string; signal?: string };
      const stderr = execError.stderr?.toString().trim() || '';
      const stdout = execError.stdout?.toString().trim() || '';
      const code = execError.code;
      const signal = execError.signal;

      // Create a detailed error object
      const commandError = new Error() as CommandError;
      commandError.cmd = cmd;
      commandError.code = code;
      commandError.signal = signal;
      commandError.stdout = stdout;
      commandError.stderr = stderr;

      // Set an informative error message, excluding stdout to avoid verbosity
      const details = [
        stderr && `Error: ${stderr}`,
        code && `Exit code: ${code}`,
        signal && `Signal: ${signal}`,
        `Command: ${cmd}`
      ].filter(Boolean).join('\n');

      commandError.message = details || 'Command execution failed with no error details';

      // Log the error details (including stdout for debugging purposes)
      logger.error('Command execution failed:', {
        cmd,
        stderr,
        stdout,
        code,
        signal
      });

      throw commandError;
    }
    
    // Unknown errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Command execution failed:', {
      cmd,
      error: errorMessage
    });
    throw new Error(`Command execution failed: ${errorMessage}. Command: ${cmd}`);
  }
} 