import { execSync } from "node:child_process";
import { logger } from "../services/logger.js";

export interface CommandOptions {
  env?: NodeJS.ProcessEnv;
  maxBuffer?: number;
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
    if (error && typeof error === 'object' && 'stderr' in error) {
      const execError = error as { stderr: Buffer; stdout?: Buffer };
      const stderr = execError.stderr.toString().trim();
      
      // If stderr is empty but stdout exists, return stdout
      if (!stderr && execError.stdout) {
        return execError.stdout.toString();
      }

      // Real stderr error
      logger.error('Command execution failed:', stderr);
      throw new Error(`Command execution failed: ${stderr}. Command: ${cmd}`);
    }
    
    // Unknown errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Command execution failed:', errorMessage);
    throw new Error(`Command execution failed: ${errorMessage}. Command: ${cmd}`);
  }
} 