import * as path from 'path';
import * as fs from 'fs';
import { logger } from "./logger.js";

export class ConfigurationService {
  private static instance: ConfigurationService;
  private modLocation: string;

  private constructor() {
    // Initialize with environment variable
    this.modLocation = process.env.POWERPIPE_MCP_MOD_LOCATION || 
      process.env.POWERPIPE_MOD_LOCATION ||
      '';  // Empty string as placeholder, will be set by required argument
    logger.debug(`Initialized ConfigurationService with mod location: ${this.modLocation}`);
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Validate and resolve a mod location path
   * @param location Absolute or relative path to validate
   * @returns The resolved path if valid
   * @throws Error if the path is invalid or directory doesn't exist
   */
  private validateModLocation(location: string): string {
    const resolvedPath = path.resolve(location);
    
    try {
      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${resolvedPath}`);
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Directory does not exist: ${resolvedPath}`);
      }
      throw error; // Re-throw other file system errors
    }

    return resolvedPath;
  }

  /**
   * Set the working directory for Powerpipe mods
   * @param location Absolute or relative path to the mod location
   * @returns Object containing success status and error message if failed
   */
  public setModLocation(location: string): { success: boolean; error?: string } {
    try {
      const resolvedPath = this.validateModLocation(location);
      this.modLocation = resolvedPath;
      logger.info(`Set mod location to: ${resolvedPath}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to set mod location: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get the current working directory for Powerpipe mods
   * @returns The absolute path to the current mod location
   */
  public getModLocation(): string {
    return this.modLocation;
  }

  /**
   * Parse command line arguments for mod location configuration
   * @param args Command line arguments array
   */
  public parseCommandLineArgs(args: string[]): void {
    const modLocation = args[2]; // First argument after node and script path
    if (!modLocation) {
      logger.error('Error: Mod location is required. Please provide it as the first argument.');
      process.exit(1);
    }

    const result = this.setModLocation(modLocation);
    if (!result.success) {
      logger.error(`Error: ${result.error}`);
      process.exit(1);
    }
  }
} 