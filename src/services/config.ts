import * as path from 'path';
import { logger } from "./logger.js";

export class ConfigurationService {
  private static instance: ConfigurationService;
  private defaultModLocation: string;

  private constructor() {
    // Initialize with environment variable or default to current working directory
    // Check for MCP-specific var first, fall back to general Powerpipe var, then cwd
    this.defaultModLocation = process.env.POWERPIPE_MCP_MOD_LOCATION || 
      process.env.POWERPIPE_MOD_LOCATION ||
      process.cwd();
    logger.debug(`Initialized ConfigurationService with mod location: ${this.defaultModLocation}`);
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Set the working directory for Powerpipe mods
   * @param location Absolute or relative path to the mod location
   * @returns true if location was set successfully, false otherwise
   */
  public setModLocation(location: string): boolean {
    try {
      const resolvedPath = path.resolve(location);
      // TODO: Add validation that the directory contains valid Powerpipe mods
      this.defaultModLocation = resolvedPath;
      logger.info(`Set mod location to: ${resolvedPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set mod location: ${error}`);
      return false;
    }
  }

  /**
   * Get the current working directory for Powerpipe mods
   * @returns The absolute path to the current mod location
   */
  public getModLocation(): string {
    return this.defaultModLocation;
  }

  /**
   * Reset the working directory to the default value
   * @returns true if reset was successful, false otherwise
   */
  public resetModLocation(): boolean {
    try {
      this.defaultModLocation = this.defaultModLocation;
      logger.info(`Reset mod location to default: ${this.defaultModLocation}`);
      return true;
    } catch (error) {
      logger.error(`Failed to reset mod location: ${error}`);
      return false;
    }
  }

  /**
   * Parse command line arguments for mod location configuration
   * @param args Command line arguments array
   */
  public parseCommandLineArgs(args: string[]): void {
    const modLocIndex = args.indexOf('--mod-location');
    if (modLocIndex !== -1 && modLocIndex + 1 < args.length) {
      const location = args[modLocIndex + 1];
      this.setModLocation(location);
    }
  }
} 