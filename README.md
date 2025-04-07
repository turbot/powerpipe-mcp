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

#### Control Tools
- List available controls
- Get control details and status
- Run controls on-demand
- Analyze control results

#### Benchmark Tools
- List available benchmarks
- Get benchmark details
- View benchmark compliance status
- Get remediation suggestions

#### Configuration Tools
- Set working directory for Powerpipe mods
- Get current working directory
- Reset to default working directory

### Resource Templates

The Powerpipe MCP includes resource templates that define how to interact with different types of resources. Currently supported resource types:

#### Benchmark
- Represents a Powerpipe benchmark definition
- Contains controls, metadata, and compliance requirements

#### Control
- Represents a Powerpipe control
- Contains queries, expected results, and remediation steps

Resource templates enable structured access to Powerpipe's compliance data, making it easier for AI tools to understand and help manage your cloud security posture.

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
    "args": ["--mod-directory", "/path/to/your/mods"]
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

The Powerpipe MCP server can be configured to work with mods in a specific directory. There are several ways to set this:

1. Environment Variable:
```bash
POWERPIPE_MOD_LOCATION=/path/to/mods node dist/index.js
```

2. Command Line Argument:
```bash
node dist/index.js --mod-directory /path/to/mods
```

3. Using the Configuration Tool:
```
Set the working directory to /path/to/mods
```

The working directory can be changed at any time during operation using the configuration tools.

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

Set the working directory to /path/to/my/custom/mods
```

### Writing Good Prompts

When writing prompts:

- Be specific about what compliance aspects you want to check
- Reference specific benchmarks or control categories
- Include context about your compliance requirements
- Specify the working directory if using custom mods

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

With custom mod directory:
```bash
node dist/index.js --mod-directory /path/to/mods
```

### Environment Variables

The following environment variables can be used to configure the MCP server:

- `POWERPIPE_MOD_LOCATION`: Set the working directory for Powerpipe mods
- `POWERPIPE_LOG_LEVEL`: Control logging verbosity with these values:
  - ERROR
  - WARN
  - INFO
  - DEBUG
  - TRACE
- `POWERPIPE_MCP_DEBUG`: Set to 'true' to enable additional debug logging

Example:
```bash
POWERPIPE_MOD_LOCATION=/path/to/mods POWERPIPE_LOG_LEVEL=DEBUG node dist/index.js
```

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