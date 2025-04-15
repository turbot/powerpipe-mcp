#!/usr/bin/env node

import { ConfigurationService } from "./services/config.js";
import { Logger } from "./services/logger.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupTools, tools } from "./tools/index.js";
import { setupPrompts, prompts } from "./prompts/index.js";
import { setupResourceHandlers, resources } from "./resources/index.js";
import { setupResourceTemplates, resourceTemplates } from "./resourceTemplates/index.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const logger = new Logger();

// Read package.json for server metadata
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

// Initialize configuration
const config = ConfigurationService.getInstance();
config.parseCommandLineArgs(process.argv);

// Create MCP server
const server = new Server(
  {
    name: "powerpipe",
    version: packageJson.version,
    description: packageJson.description,
    vendor: packageJson.author,
    homepage: packageJson.homepage,
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
