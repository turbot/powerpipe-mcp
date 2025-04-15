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

## Features

### Prompts

- Best practices for working with Powerpipe controls and benchmarks

### Tools

The server provides several tools for interacting with your benchmarks and controls:

#### Most Frequently Used Operations

##### Benchmark Tools
- `powerpipe_benchmark_list` - List all available Powerpipe benchmarks
- `powerpipe_benchmark_show` - Get detailed information about a specific benchmark
- `powerpipe_benchmark_run` - Run a specific benchmark

##### Control Tools
- `powerpipe_control_list` - List all available Powerpipe controls
- `powerpipe_control_show` - Get detailed information about a specific control
- `powerpipe_control_run` - Run a specific control

#### Secondary Operations

##### Detection Tools
- `powerpipe_detection_list` - List all available Powerpipe detections
- `powerpipe_detection_show` - Get detailed information about a specific detection
- `powerpipe_detection_run` - Run a specific detection

##### Query Tools
- `powerpipe_query_list` - List all available Powerpipe queries
- `powerpipe_query_show` - Get detailed information about a specific query

#### Configuration & Utilities

##### Mod Tools
- `powerpipe_mod_location` - Get or set the Powerpipe mod location

##### Variable Tools
- `powerpipe_variable_list` - List all available Powerpipe variables
- `powerpipe_variable_show` - Get detailed information about a specific variable

##### Dashboard Tools
- `powerpipe_dashboard_list` - List all available Powerpipe dashboards
- `powerpipe_dashboard_show` - Get detailed information about a specific dashboard
- `powerpipe_dashboard_run` - Run a specific dashboard

##### Documentation Tools
The Powerpipe MCP server provides access to the following resources:

#### Status
- URI: `powerpipe://status`
- Provides server status information including:
  - Powerpipe version
  - Server version
  - Server start time

Resources enable structured access to Powerpipe's system information and status.

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Powerpipe CLI installed and configured

### Install from npm

```bash
npm install @turbot/powerpipe-mcp
```

### Configuration

Add to your `.mcpconfig.json`:

```json
{
  "powerpipe": {
    "name": "Powerpipe",
    "description": "Work with Powerpipe benchmarks and controls",
    "server": "github:turbot/powerpipe-mcp"
  }
}
```

You can optionally specify a working directory for your Powerpipe mods:

```json
{
  "powerpipe": {
    "name": "Powerpipe",
    "description": "Work with Powerpipe benchmarks and controls",
    "server": "github:turbot/powerpipe-mcp",
    "args": ["--mod-location", "/path/to/your/mods"]
  }
}
```

### Cursor Installation

To install the Powerpipe MCP server in Cursor:

1. Install the MCP plugin in Cursor

2. Add the following configuration:

```json
{
  "powerpipe": {
    "name": "Powerpipe",
    "description": "Work with Powerpipe benchmarks and controls",
    "server": "github:turbot/powerpipe-mcp"
  }
}
```

3. Restart Cursor

4. The Powerpipe MCP server will now be available in your Cursor environment.

## Usage

### Working Directory Configuration

The Powerpipe MCP server can be configured to work with mods in a specific location. There are several ways to set this:

1. Environment Variable:
```bash
POWERPIPE_MCP_MOD_LOCATION=/path/to/mods node dist/index.js
```

2. Command Line Argument:
```bash
node dist/index.js --mod-location /path/to/mods
```

3. Using the Configuration Tool:
```
Set the mod location to /path/to/mods
```

The mod location can be changed at any time during operation using the configuration tools.

### Best Practices

The Powerpipe MCP includes a pre-built `best_practices` prompt. Running it before running your own prompts will teach the LLM how to work most effectively with Powerpipe, including:

- How to work with benchmarks and controls
- How to interpret compliance results
- How to suggest remediation steps

### Example Prompts

Each prompt below is designed to work with Powerpipe's benchmarking capabilities:

```
Show me all controls that failed in the CIS AWS Benchmark.

List controls related to S3 bucket encryption.

What remediation steps are suggested for non-compliant IAM password policies?

Set the mod location to /path/to/my/custom/mods
```

### Writing Good Prompts

When writing prompts:

- Be specific about what compliance aspects you want to check
- Reference specific benchmarks or control categories
- Include context about your compliance requirements
- Specify the mod location if using custom mods

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
node dist/index.js --mod-location /path/to/mods
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