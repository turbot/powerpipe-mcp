import path from 'path';

/**
 * Constructs a Powerpipe CLI command with consistent flags and options
 * @param command The base command (e.g., 'benchmark list', 'control run foo')
 * @param modLocation The mod location directory
 * @param options Additional options to include
 * @returns The complete command string
 */
export function buildPowerpipeCommand(command: string, modLocation: string, options: { output?: string } = {}): string {
  const parts = [
    'powerpipe',
    command,
    '--no-update-check',
    `--mod-location "${modLocation}"`,
  ];

  if (options.output) {
    parts.push(`--output ${options.output}`);
  }

  return parts.join(' ');
}

/**
 * Gets the environment variables for Powerpipe CLI execution
 * @param modLocation The mod location directory
 * @returns Environment variables object
 */
export function getPowerpipeEnv(modLocation: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    POWERPIPE_MOD_LOCATION: modLocation,
  };
} 