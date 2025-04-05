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

const DEFAULT_MAX_BUFFER = 10 * 1024 * 1024; // 10MB buffer

export function executeCommand(cmd: string, options: CommandOptions = {}) {
  try {
    const execOptions = {
      encoding: 'utf-8' as const,
      env: options.env || process.env,
      maxBuffer: options.maxBuffer || DEFAULT_MAX_BUFFER
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

      // Set an informative error message
      const details = [
        stderr && `Error: ${stderr}`,
        stdout && `Output: ${stdout}`,
        code && `Exit code: ${code}`,
        signal && `Signal: ${signal}`,
        `Command: ${cmd}`
      ].filter(Boolean).join('\n');

      commandError.message = details || 'Command execution failed with no error details';

      // Log the error details
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