import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { formatCommandError } from "../utils/command.js";
import { logger } from "../services/logger.js";
import https from 'https';

interface DocsHclParams {
  element: string;
}

function validateParams(args: unknown): DocsHclParams {
  if (!args || typeof args !== 'object') {
    throw new Error('Arguments must be an object');
  }

  const params = args as Partial<DocsHclParams>;
  if (!params.element || typeof params.element !== 'string') {
    throw new Error('element is required and must be a string');
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
  name: "docs_hcl",
  description: "Get HCL documentation for Powerpipe elements (benchmark, control, query, etc)",
  inputSchema: {
    type: "object",
    properties: {
      element: {
        type: "string",
        description: "The element name to get documentation for (e.g. benchmark, control, query, dashboard, chart)"
      }
    },
    required: ["element"],
    additionalProperties: false
  },
  handler: async (args: unknown) => {
    const params = validateParams(args);

    try {
      const docs = await fetchDocs(params.element);
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