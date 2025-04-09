#!/usr/bin/env node

import { ConfigurationService } from "./services/config.js";
import { Logger } from "./services/logger.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupTools, tools } from "./tools/index.js";
import { setupPrompts, prompts } from "./prompts/index.js";
import { setupResourceHandlers, resources } from "./resources/index.js";
import { setupResourceTemplates, resourceTemplates } from "./resourceTemplates/index.js";

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
      tools,
      prompts,
      resources,
      resourceTemplates
    }
  }
);

// Set up handlers
setupTools(server);
setupPrompts(server);
setupResourceHandlers(server);
setupResourceTemplates(server);

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
