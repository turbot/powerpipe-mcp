import { ListResourcesRequestSchema, ReadResourceRequestSchema, type ReadResourceRequest, type ServerResult, type Resource } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { handleStatusResource } from "./status.js";
import { logger } from '../services/logger.js';

// Export all resources for server capabilities
export const resources = {
  status: {
    uri: "powerpipe://status",
    name: "status",
    type: "Status",
    description: "Server status information"
  }
} as const;

export function setupResourceHandlers(server: Server) {
  // Add resources/list handler
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    try {
      return { 
        resources: Object.values(resources),
        _meta: {}
      };
    } catch (error) {
      // Log the error but don't fail - return default resources
      if (error instanceof Error) {
        logger.error("Critical error listing resources:", error.message);
      } else {
        logger.error("Critical error listing resources:", error);
      }
      
      // Provide at least the status resource
      return { 
        resources: Object.values(resources),
        _meta: {}
      };
    }
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest): Promise<ServerResult> => {
    const { uri } = request.params;

    try {
      const result = await handleStatusResource(uri);

      if (!result) {
        throw new Error(`Invalid resource URI: ${uri}. Expected format: powerpipe://status`);
      }

      return result;
    } catch (error) {
      // Just wrap the error with the URI context
      throw new Error(`Failed to access resource ${uri}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
} 