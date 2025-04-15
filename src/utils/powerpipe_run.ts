import { CommandError, formatCommandError } from "./command.js";
import { logger } from "../services/logger.js";

/**
 * Handle the output from powerpipe run commands that return JSON.
 * 
 * Powerpipe run commands (benchmark, control, detection) may exit with non-zero status
 * even when they successfully execute and return valid JSON output. This happens when
 * the checks detect issues:
 * 
 * Exit codes:
 * - 0: Success - ran successfully with no alarms or errors
 * - 1: Alarm - completed successfully but there were one or more alarms
 * - 2: Error - completed but one or more control errors occurred
 * 
 * In these cases, we want to return the JSON output (which contains the failure details)
 * rather than treating it as a command error.
 * 
 * @param error The error from executeCommand
 * @param cmd The command that was executed
 * @returns Formatted response with either parsed JSON output or error message
 */
export function handlePowerpipeRunOutput(error: unknown, cmd: string) {
  // If we have stdout, try to return it as valid output even if command failed
  if (error instanceof Error && 'stdout' in error) {
    const cmdError = error as CommandError;
    if (cmdError.stdout) {
      try {
        // Validate it's JSON
        const parsed = JSON.parse(cmdError.stdout);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              output: parsed,
              debug: {
                command: cmd
              }
            })
          }]
        };
      } catch (parseError) {
        logger.error('Failed to parse powerpipe output:', parseError);
      }
    }
  }
  return formatCommandError(error, cmd);
} 