import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, formatCommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface ControlRunParams {
  qualified_name: string;
}

function validateParams(args: unknown): ControlRunParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<ControlRunParams>;
  if (!params.qualified_name || typeof params.qualified_name !== 'string') {
    throw new Error('qualified_name is required and must be a string');
  }

  return params as ControlRunParams;
}

interface PanelError {
  name: string;
  title: string;
  error: string;
}

function extractPanelErrors(output: string): PanelError[] {
  try {
    const result = JSON.parse(output);
    const errors: PanelError[] = [];
    
    // Check each panel for errors
    if (result.panels) {
      for (const [name, panel] of Object.entries<any>(result.panels)) {
        if (panel.error) {
          errors.push({
            name,
            title: panel.title || name,
            error: panel.error
          });
        }
      }
    }
    
    return errors;
  } catch (e) {
    logger.error('Failed to parse PPS output:', e);
    return [];
  }
}

export const tool: Tool = {
  name: "control_run",
  description: "Run a Powerpipe control by its qualified name",
  inputSchema: {
    type: "object",
    properties: {
      qualified_name: {
        type: "string",
        description: "The qualified name of the control to run"
      }
    },
    required: ["qualified_name"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand(`control run ${params.qualified_name}`, modDirectory, { output: 'pps' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      
      // Check for panel errors in the PPS output
      const panelErrors = extractPanelErrors(output);
      if (panelErrors.length > 0) {
        const errorMessages = panelErrors.map(err => 
          `Error in panel "${err.title}":\n${err.error}`
        ).join('\n\n');
        
        return {
          isError: true,
          content: [{
            type: "text",
            text: errorMessages
          }]
        };
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            output,
            debug: {
              command: cmd
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      return formatCommandError(error, cmd);
    }
  }
}; 