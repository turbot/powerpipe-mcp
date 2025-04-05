import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../services/logger.js";
import { ConfigurationService } from "../services/config.js";
import { executeCommand, CommandError } from "../utils/command.js";

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
  const result = {
    benchmarks,
    debug: {
      command: cmd
    }
  };

  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
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
    const modDirectory = config.getModDirectory();
    const cmd = `powerpipe benchmark list --output json --mod-location "${modDirectory}"`;

    const env = {
      ...process.env,
      POWERPIPE_MOD_DIRECTORY: modDirectory
    };

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
          cmdError.stdout && `Output: ${cmdError.stdout}`,
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