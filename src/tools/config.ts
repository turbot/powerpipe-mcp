import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";

export interface SetModDirectoryParams {
  directory: string;
}

type ToolHandler<T = unknown> = (args: T) => Promise<{
  type: string;
  text: string;
}>;

export const setModDirectoryTool = {
  name: "set_mod_directory",
  description: "Set the working directory for Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {
      directory: {
        type: "string",
        description: "The path to the directory containing Powerpipe mods"
      }
    },
    required: ["directory"]
  },
  handler: (async ({ directory }: SetModDirectoryParams) => {
    const config = ConfigurationService.getInstance();
    const success = config.setModDirectory(directory);
    
    if (success) {
      return {
        type: "text",
        text: `Successfully set mod directory to: ${directory}`
      };
    } else {
      return {
        type: "error",
        text: `Failed to set mod directory to: ${directory}`
      };
    }
  }) as ToolHandler<SetModDirectoryParams>
} as const;

export const getModDirectoryTool = {
  name: "get_mod_directory",
  description: "Get the current working directory for Powerpipe mods",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: (async () => {
    const config = ConfigurationService.getInstance();
    const directory = config.getModDirectory();
    
    return {
      type: "text",
      text: `Current mod directory: ${directory}`
    };
  }) as ToolHandler<Record<string, never>>
} as const;

export const resetModDirectoryTool = {
  name: "reset_mod_directory",
  description: "Reset the working directory to the default value",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: (async () => {
    const config = ConfigurationService.getInstance();
    const success = config.resetModDirectory();
    
    if (success) {
      return {
        type: "text",
        text: `Successfully reset mod directory to default`
      };
    } else {
      return {
        type: "error",
        text: "Failed to reset mod directory"
      };
    }
  }) as ToolHandler<Record<string, never>>
} as const; 