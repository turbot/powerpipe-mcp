import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, type CommandError } from "../utils/command.js";
import { buildPowerpipeCommand, getPowerpipeEnv } from "../utils/powerpipe.js";
import { logger } from "../services/logger.js";

interface Benchmark {
  title: string;
  qualified_name: string;
  documentation: string;
  tags: Record<string, string>;
}

function parseBenchmarks(output: string): Benchmark[] {
  const rawBenchmarks = JSON.parse(output);
  if (!Array.isArray(rawBenchmarks)) {
    throw new Error('Expected array output from Powerpipe CLI');
  }

  // Filter to only include specified fields
  return rawBenchmarks.map(benchmark => ({
    title: benchmark.title || '',
    qualified_name: benchmark.qualified_name || '',
    documentation: benchmark.documentation || '',
    tags: typeof benchmark.tags === 'object' && benchmark.tags !== null ? benchmark.tags : {}
  }));
}

function formatResult(benchmarks: Benchmark[], cmd: string) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        benchmarks,
        debug: {
          command: cmd
        }
      }, null, 2)
    }]
  };
}

export const tool: Tool = {
  name: "benchmark_list",
  description: "List all available Powerpipe benchmarks",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => {
    const config = ConfigurationService.getInstance();
    const modDirectory = config.getModLocation();
    const cmd = buildPowerpipeCommand('benchmark list', modDirectory, { output: 'json' });
    const env = getPowerpipeEnv(modDirectory);

    try {
      const output = executeCommand(cmd, { env });
      const benchmarks = parseBenchmarks(output);
      return formatResult(benchmarks, cmd);
    } catch (error) {
      // JSON parsing errors
      if (error instanceof SyntaxError) {
        logger.error('Failed to parse Powerpipe CLI output:', error.message);
        throw new Error(`Failed to parse Powerpipe CLI output: ${error.message}. Command: ${cmd}`);
      }

      // Command execution errors
      if (error instanceof Error && 'stderr' in error) {
        const cmdError = error as CommandError;
        const details = [
          cmdError.stderr && `Error: ${cmdError.stderr}`,
          cmdError.code && `Exit code: ${cmdError.code}`,
          cmdError.signal && `Signal: ${cmdError.signal}`,
          cmdError.cmd && `Command: ${cmdError.cmd}`
        ].filter(Boolean).join('\n');

        throw new Error(`Failed to run Powerpipe CLI:\n${details}`);
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}; 