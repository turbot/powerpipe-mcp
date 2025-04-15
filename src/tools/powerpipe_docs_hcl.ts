import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { formatCommandError } from "../utils/command.js";
import { logger } from "../services/logger.js";
import https from 'https';

interface DocsHclParams {
  element?: string;
}

const AVAILABLE_ELEMENTS = [
  'benchmark',
  'card',
  'category',
  'chart',
  'container',
  'control',
  'dashboard',
  'detection',
  'edge',
  'flow',
  'functions',
  'graph',
  'hierarchy',
  'image',
  'input',
  'locals',
  'mod',
  'node',
  'query',
  'table',
  'text',
  'variable',
  'with'
];

function generateOverview(): string {
  return `# Powerpipe HCL Elements

Powerpipe uses HCL (HashiCorp Configuration Language) to define its configuration. The following elements are available:

${AVAILABLE_ELEMENTS.map(element => `- \`${element}\` - View detailed documentation with \`element: "${element}"\``).join('\n')}

Use this tool with a specific element name to view its detailed documentation.`;
}

function validateParams(args: unknown): DocsHclParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<DocsHclParams>;
  
  // Element is optional
  if (params.element !== undefined) {
    if (typeof params.element !== 'string') {
      throw new Error('If provided, element must be a string');
    }
    if (!AVAILABLE_ELEMENTS.includes(params.element)) {
      throw new Error(`Invalid element: ${params.element}. Must be one of: ${AVAILABLE_ELEMENTS.join(', ')}`);
    }
  }

  return params as DocsHclParams;
}

function fetchDocs(element: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/turbot/powerpipe-docs/refs/heads/main/docs/powerpipe-hcl/${element}.md`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        reject(new Error(`Documentation not found for element: ${element}`));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch documentation: HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export const tool: Tool = {
  name: "powerpipe_docs_hcl",
  description: "Provides detailed documentation and examples for writing Powerpipe HCL configurations. Use this tool to understand the syntax and options available for each element type (benchmarks, controls, queries, etc). Essential reference when writing or modifying Powerpipe mod files.",
  inputSchema: {
    type: "object",
    properties: {
      element: {
        type: "string",
        description: "The element name to get documentation for. If not provided, returns an overview of available elements.",
        enum: AVAILABLE_ELEMENTS
      }
    },
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);

    try {
      const docs = params.element ? 
        await fetchDocs(params.element) : 
        generateOverview();

      return {
        content: [{
          type: "text",
          text: docs
        }]
      };
    } catch (error) {
      return formatCommandError(error);
    }
  }
}; 