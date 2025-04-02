import * as path from 'path';
import { Logger } from './logger.js';

export class ConfigurationService {
  private static instance: ConfigurationService;
  private modDirectory: string;
  private defaultModDirectory: string;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger();
    this.defaultModDirectory = process.env.POWERPIPE_MOD_DIRECTORY || process.cwd();
    this.modDirectory = this.defaultModDirectory;
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Set the working directory for Powerpipe mods
   * @param directory Absolute or relative path to the mod directory
   * @returns true if directory was set successfully, false otherwise
   */
  public setModDirectory(directory: string): boolean {
    try {
      const resolvedPath = path.resolve(directory);
      // TODO: Add validation that the directory contains valid Powerpipe mods
      this.modDirectory = resolvedPath;
      this.logger.info(`Set mod directory to: ${resolvedPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set mod directory: ${error}`);
      return false;
    }
  }

  /**
   * Get the current working directory for Powerpipe mods
   * @returns The absolute path to the current mod directory
   */
  public getModDirectory(): string {
    return this.modDirectory;
  }

  /**
   * Reset the working directory to the default value
   * @returns true if reset was successful, false otherwise
   */
  public resetModDirectory(): boolean {
    try {
      this.modDirectory = this.defaultModDirectory;
      this.logger.info(`Reset mod directory to default: ${this.defaultModDirectory}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to reset mod directory: ${error}`);
      return false;
    }
  }

  /**
   * Parse command line arguments for mod directory configuration
   * @param args Command line arguments array
   */
  public parseCommandLineArgs(args: string[]): void {
    const modDirIndex = args.indexOf('--mod-directory');
    if (modDirIndex !== -1 && modDirIndex + 1 < args.length) {
      const directory = args[modDirIndex + 1];
      this.setModDirectory(directory);
    }
  }
} 