# Powerpipe Model Context Protocol (MCP) Server

Enable AI assistants like Claude to explore and work with your Powerpipe benchmarks and controls! This Model Context Protocol (MCP) server lets AI tools:

- Browse your Powerpipe benchmarks and controls
- Understand compliance status
- Help analyze and remediate findings
- Assist with benchmark development

## Use Cases

- Having AI assist with Powerpipe benchmark development
- Enabling natural language interactions with your compliance data
- Getting AI help analyzing compliance findings
- Automating remediation suggestions

## Overview

Connects directly to your Powerpipe installation, giving you AI access to your cloud security and compliance benchmarking data. Powerpipe helps you assess your cloud infrastructure against security benchmarks and compliance frameworks.

## Capabilities

### Tools

#### Core Benchmark & Control Operations
- **powerpipe_benchmark_list**, **powerpipe_benchmark_show**, **powerpipe_benchmark_run**
  - List, view, and run Powerpipe benchmarks
  - Input for show/run: `qualified_name` (string): The qualified name of the benchmark
  - Returns benchmark metadata and execution results
  - Run command handles non-zero exit codes (1-2) for alarms/errors

- **powerpipe_control_list**, **powerpipe_control_show**, **powerpipe_control_run**
  - List, view, and run Powerpipe controls
  - Input for show/run: `qualified_name` (string): The qualified name of the control
  - Returns control metadata and execution results
  - Run command handles non-zero exit codes (1-2) for alarms/errors

#### Detection & Query Operations
- **powerpipe_detection_list**, **powerpipe_detection_show**, **powerpipe_detection_run**
  - List, view, and run Powerpipe detections
  - Input for show/run: `qualified_name` (string): The qualified name of the detection
  - Used for continuous monitoring and threat detection

- **powerpipe_query_list**, **powerpipe_query_show**
  - List and view Powerpipe queries
  - Input for show: `qualified_name` (string): The qualified name of the query
  - Used to understand the underlying queries that power controls

#### Dashboard Operations
- **powerpipe_dashboard_list**, **powerpipe_dashboard_show**, **powerpipe_dashboard_run**
  - List, view, and run Powerpipe dashboards
  - Input for show/run: `qualified_name` (string): The qualified name of the dashboard
  - Used for visualizing compliance and control results

#### Variable Management
- **powerpipe_variable_list**, **powerpipe_variable_show**
  - List and view Powerpipe variables
  - Input for show: `qualified_name` (string): The qualified name of the variable
  - Used to understand and manage variable definitions

#### Configuration & Documentation
- **powerpipe_mod_location**
  - Get or set the Powerpipe mod location
  - Optional input: `location` (string): The location to set
  - Returns current location if no input provided

- **powerpipe_docs_hcl**
  - Get HCL documentation for Powerpipe elements
  - Input: `element` (string): The element type to get documentation for
  - Helps with understanding HCL syntax and structure

### Prompts

- **best_practices**
  - Best practices for working with Powerpipe
  - Provides detailed guidance on:
    - Working with benchmarks and controls
    - Understanding compliance results
    - Interpreting control failures
    - Suggesting remediation steps
    - Using mod locations effectively
    - Managing variables and configuration
    - Writing and organizing controls
    - Performance considerations

### Resources

The Powerpipe MCP provides access to the following resources:

- **status**
  - Represents the current state of the Powerpipe server
  - Properties include:
    - powerpipe_version: The current Powerpipe CLI version
    - server_version: The MCP server version
    - server_start_time: When the server was started
    - mod_location: Current working directory for mods

This resource enables AI tools to check and verify the Powerpipe environment state.

## Installation

### Claude Desktop

[How to use MCP servers with Claude Desktop →](https://modelcontextprotocol.io/quickstart/user)

Add the following configuration to the "mcpServers" section of your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "powerpipe": {
      "command": "npx",
      "args": [
        "-y",
        "github:turbot/powerpipe-mcp",
        "/path/to/your/mods"  # Required: Path to your Powerpipe mods directory
      ]
    }
  }
}
```

### Cursor

To install the Powerpipe MCP server in Cursor:

1. Open your Cursor MCP configuration file:
   ```sh
   open ~/.cursor/mcp.json  # On macOS
   # or
   code ~/.cursor/mcp.json  # Using VS Code
   ```

2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "powerpipe": {
         "name": "Powerpipe",
         "description": "Work with Powerpipe benchmarks and controls",
         "server": "github:turbot/powerpipe-mcp",
         "args": ["/path/to/your/mods"]  # Required: Path to your Powerpipe mods directory
       }
     }
   }
   ```

3. Save the configuration file and restart Cursor for the changes to take effect.

4. The Powerpipe MCP server will now be available in your Cursor environment.

5. To run the server:
```sh
# The mod location argument is required
node dist/index.js /path/to/your/mods
```

## Prompting Guide

### Best Practices

The Powerpipe MCP includes a pre-built `best_practices` prompt. Running it before running your own prompts will teach the LLM how to work most effectively with Powerpipe, including:

- How to explore available benchmarks and controls using powerpipe_benchmark_list and powerpipe_control_list
- When to use specific tools for different operations (benchmarks, controls, detections, etc.)
- How to interpret compliance results and suggest remediation steps
- Best practices for working with mod locations and variables

In Claude Desktop, you can load this prompt through the plug icon in the prompt window.

### Example Prompts

Each prompt below is designed to work with Powerpipe's various components:

```
List all available benchmarks
```

```
Show me details about the CIS AWS Benchmark
```

```
Find all controls related to S3 bucket encryption
```

```
Run the AWS security benchmark and analyze the results
```

Remember to:
- Ask about specific benchmarks, controls, or compliance areas
- Be clear about which frameworks or standards you're interested in
- Start with simple questions about one component
- Add more complexity or conditions after seeing the initial results

Claude will:
- Choose the appropriate Powerpipe tools for your request
- Run benchmarks and controls as needed
- Format the results in a clear, readable way
- Provide insights and remediation suggestions based on the findings

## Local Development

To set up the project for local development:

1. Clone the repository and navigate to the directory:
```sh
git clone https://github.com/turbot/powerpipe-mcp.git
cd powerpipe-mcp
```

2. Install dependencies:
```sh
npm install
```

3. Build the project:
```sh
npm run build
```

4. For development with auto-recompilation:
```sh
npm run watch
```

5. To run the server:
```sh
# Run with default mod location
node dist/index.js

# Run with custom mod location
node dist/index.js /path/to/your/mods
```

6. To test:
```sh
npm test
```

## Environment Variables

The following environment variables can be used to configure the Powerpipe MCP server:

- `POWERPIPE_MCP_MOD_LOCATION`: Set the mod location for Powerpipe
- `POWERPIPE_MCP_LOG_LEVEL`: Set the logging level (debug, info, warn, error)
- `POWERPIPE_MCP_PORT`: Set the server port (default: 7891)

## Development

### Clone the Repository

```bash
git clone https://github.com/turbot/powerpipe-mcp.git
cd powerpipe-mcp
```

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
node dist/index.js
```

With custom mod location:
```bash
node dist/index.js /path/to/your/mods
```

### Environment Variables

The following environment variables can be used to configure the MCP server:

- `POWERPIPE_MCP_MOD_LOCATION`: Set the working directory for Powerpipe mods (falls back to POWERPIPE_MOD_LOCATION if not set)
- `POWERPIPE_MCP_LOG_LEVEL`: Control MCP server logging verbosity with these values:
  - ERROR
  - WARN
  - INFO
  - DEBUG
  - TRACE
- `POWERPIPE_MCP_MEMORY_MAX_MB`: Maximum memory buffer size in megabytes (default: 100)

Example:
```bash
POWERPIPE_MCP_MOD_LOCATION=/path/to/mods POWERPIPE_MCP_LOG_LEVEL=DEBUG POWERPIPE_MCP_MEMORY_MAX_MB=200 node dist/index.js
```

Note: When using the Powerpipe CLI through the MCP server, the `POWERPIPE_MOD_LOCATION` environment variable is automatically set based on the MCP configuration.

### Local Development with Cursor

To use a local development version of the server with Cursor, update your `.mcpconfig.json` to use a local file path instead of the npm package:

```json
{
  "powerpipe": {
    "name": "Powerpipe",
    "description": "Work with Powerpipe benchmarks and controls",
    "command": "/absolute/path/to/dist/index.js"
  }
}
```

For example, if you cloned the repository to `~/src/powerpipe-mcp`, you would use `~/src/powerpipe-mcp/dist/index.js`.

### Testing

```bash
npm test
```

### Validate MCP Implementation

Use the MCP Inspector to validate the server implementation:

```bash
npx @modelcontextprotocol/inspector dist/index.js
```

## License

[Powerpipe](https://powerpipe.io) is a product produced from this open source software, exclusively by [Turbot HQ, Inc](https://turbot.com). It is distributed under our commercial terms. Others are allowed to make their own distribution of the software, there is no commercial exclusivity for the Powerpipe trademark or brand.

## Get Involved

**[Join #powerpipe on Slack →](https://turbot.com/community/join)**

Want to help but not sure where to start? Pick up one of the `help wanted` issues:
* [Powerpipe](https://github.com/turbot/powerpipe/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
* [Powerpipe MCP](https://github.com/turbot/powerpipe-mcp/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)