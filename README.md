# Powerpipe Model Context Protocol (MCP) Server

Unlock the power of AI-driven security and compliance analysis with [Powerpipe](https://powerpipe.io)! This Model Context Protocol server seamlessly connects AI assistants like Claude to your infrastructure compliance data, enabling natural language exploration and analysis of your cloud security posture.

Powerpipe MCP bridges AI assistants and your compliance data, allowing natural language:
- Exploration of security benchmarks and compliance frameworks
- Analysis of compliance status and findings
- Development and customization of controls
- Remediation guidance for failed checks

Works with your local [Powerpipe](https://powerpipe.io/downloads) installation, providing safe access to analyze your infrastructure against industry-standard security benchmarks and custom compliance frameworks.

## Use Cases

- Having AI assist with Powerpipe benchmark development
- Enabling natural language interactions with your compliance data
- Getting AI help analyzing compliance findings
- Automating remediation suggestions

## Overview

Connects directly to your Powerpipe installation, giving you AI access to your cloud security and compliance benchmarking data. Powerpipe helps you assess your cloud infrastructure against security benchmarks and compliance frameworks.

## Capabilities

### Tools

#### Essential Setup
- **powerpipe_mod_location**
  - Critical first step: Sets up the working directory for your Powerpipe mods
  - Must be configured before using any other tools
  - Get or set the directory containing your Powerpipe mod files

#### Core Benchmark Operations
- **powerpipe_benchmark_list**, **powerpipe_benchmark_show**, **powerpipe_benchmark_run**
  - Discover and work with complete compliance frameworks
  - List available compliance benchmarks and understand their scope
  - View detailed benchmark information including controls, tags, and documentation
  - Execute benchmarks to evaluate infrastructure against framework requirements

#### Control Management
- **powerpipe_control_list**, **powerpipe_control_show**, **powerpipe_control_run**
  - Work with individual compliance requirements
  - List and examine specific controls from various frameworks
  - View control implementation details and associated queries
  - Run individual controls for targeted compliance checks

#### Security Detections
- **powerpipe_detection_list**, **powerpipe_detection_show**, **powerpipe_detection_run**
  - Identify specific security issues and compliance violations
  - List available security detections
  - View detection details including severity and remediation guidance
  - Run targeted security checks with actionable results

#### Query Inspection
- **powerpipe_query_list**, **powerpipe_query_show**
  - Examine the foundation of compliance evaluation
  - List all SQL queries that power controls and detections
  - View query implementations to understand compliance checks
  - Analyze how infrastructure data is evaluated

#### Dashboard Operations
- **powerpipe_dashboard_list**, **powerpipe_dashboard_show**, **powerpipe_dashboard_run**
  - Work with compliance and security visualizations
  - List available dashboards for compliance insights
  - View dashboard structure and components
  - Execute dashboards to get JSON snapshot data of compliance status

#### Configuration Management
- **powerpipe_variable_list**, **powerpipe_variable_show**
  - Customize compliance evaluations
  - List available configuration variables
  - View variable details and current settings
  - Understand how to customize checks for your environment

#### Development Support
- **powerpipe_docs_hcl**
  - Essential reference for Powerpipe development
  - Access detailed HCL documentation and examples
  - Understand syntax for all Powerpipe elements
  - Get guidance for writing and modifying mod files

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

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher (includes `npx`)
- [Powerpipe](https://powerpipe.io/downloads) installed and configured
- A directory containing your Powerpipe mod files (required)

### Configuration

Add Powerpipe MCP to your AI assistant's configuration file:

```json
{
  "mcpServers": {
    "powerpipe": {
      "command": "npx",
      "args": [
        "-y",
        "@turbot/powerpipe-mcp",
        "/path/to/your/mod/is/required"
      ]
    }
  }
}
```

The mod location argument is required and must point to a directory containing your Powerpipe mod files. This is where Powerpipe will look for benchmarks, controls, and other resources.

### AI Assistant Setup

| Assistant | Config File Location | Setup Guide |
|-----------|---------------------|-------------|
| Claude Desktop | `claude_desktop_config.json` | [Claude Desktop MCP Guide →](https://modelcontextprotocol.io/quickstart/user) |
| Cursor | `~/.cursor/mcp.json` | [Cursor MCP Guide →](https://cursor.sh/docs/mcp) |

Save the configuration file and restart your AI assistant for the changes to take effect.

## Prompting Guide

First, run the `best_practices` prompt included in the MCP server to teach your LLM how best to work with Powerpipe. Then, ask anything!

Explore available compliance frameworks:
```
What Powerpipe benchmarks do we have available?
```

Simple, specific questions work well:
```
Show me all controls related to S3 bucket encryption in the CIS AWS benchmark
```

Generate a compliance report:
```
What's our current compliance status for the NIST controls?
```

Dive into the details:
```
Find all failed controls in the AWS Security benchmark and explain why they failed
```

Get information about specific requirements:
```
Show me all controls related to password policies across our benchmarks
```

Explore with wide ranging questions:
```
Analyze our compliance gaps and suggest remediation steps
```

Remember to:
- Be specific about which benchmarks or frameworks you're interested in
- Mention the type of controls you want to analyze (encryption, access, networking, etc.)
- Start with simple queries before adding complex conditions
- Use natural language - the LLM will handle finding the right controls and benchmarks
- Be bold and open, it's amazing what insights the LLM will discover!

## Development

### Clone and Setup

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

### Testing

To test your local development build with AI tools that support MCP, update your MCP configuration to use the local `dist/index.js` instead of the npm package. For example:

```json
{
  "mcpServers": {
    "powerpipe": {
      "command": "node",
      "args": [
        "/absolute/path/to/powerpipe-mcp/dist/index.js",
        "/path/to/your/mod/is/required"
      ]
    }
  }
}
```

Or, use the MCP Inspector to validate the server implementation:
```bash
npx @modelcontextprotocol/inspector dist/index.js
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

## License

This repository is published under the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0). Please see our [code of conduct](https://github.com/turbot/.github/blob/main/CODE_OF_CONDUCT.md). We look forward to collaborating with you!

[Powerpipe](https://powerpipe.io) is a product produced from this open source software, exclusively by [Turbot HQ, Inc](https://turbot.com). It is distributed under our commercial terms. Others are allowed to make their own distribution of the software, there is no commercial exclusivity for the Powerpipe trademark or brand.

## Get Involved

**[Join #powerpipe on Slack →](https://turbot.com/community/join)**

Want to help but not sure where to start? Pick up one of the `help wanted` issues:
* [Powerpipe](https://github.com/turbot/powerpipe/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
* [Powerpipe MCP](https://github.com/turbot/powerpipe-mcp/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)