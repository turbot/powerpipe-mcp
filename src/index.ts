#!/usr/bin/env node

import { ConfigurationService } from "./services/config.js";
import { Logger } from "./services/logger.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, type CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { setModDirectoryTool, getModDirectoryTool, resetModDirectoryTool } from "./tools/config.js";
import { MOD_LIST_TOOL, handleModListTool } from "./tools/modList.js";
import { BEST_PRACTICES_PROMPT } from "./prompts/bestPractices.js";
import { setupPrompts } from "./prompts/index.js";
import { setupResourceHandlers } from "./resources/index.js";

const logger = new Logger();

// Initialize configuration
const config = ConfigurationService.getInstance();
config.parseCommandLineArgs(process.argv);

// Create MCP server
const server = new Server(
  {
    name: "powerpipe",
    version: "0.1.0",
    description: "Work with Powerpipe benchmarks and controls for cloud security and compliance.",
    vendor: "Turbot",
    homepage: "https://github.com/turbot/powerpipe-mcp",
  },
  {
    capabilities: {
      tools: {
        set_mod_directory: setModDirectoryTool,
        get_mod_directory: getModDirectoryTool,
        reset_mod_directory: resetModDirectoryTool,
        mod_list: MOD_LIST_TOOL
      },
      prompts: {
        best_practices: BEST_PRACTICES_PROMPT,
      },
      resources: {}
    }
  }
);

// Set up handlers
setupPrompts(server);
setupResourceHandlers(server);

// Register tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case setModDirectoryTool.name: {
      const typedArgs = args as { directory: string };
      return await setModDirectoryTool.handler({ directory: typedArgs.directory });
    }
    case getModDirectoryTool.name: {
      return await getModDirectoryTool.handler({});
    }
    case resetModDirectoryTool.name: {
      return await resetModDirectoryTool.handler({});
    }
    case MOD_LIST_TOOL.name:
      return await handleModListTool();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("MCP server started successfully");
  } catch (error: unknown) {
    logger.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

startServer();
