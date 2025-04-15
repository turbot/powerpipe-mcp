import { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

export const BEST_PRACTICES_PROMPT = {
  name: "best_practices",
  description: "Best practices for working with Powerpipe benchmarks and controls",
  text: `When working with Powerpipe benchmarks and controls, follow these best practices:

1. Set up your working environment:
   - Configure the appropriate mod directory
   - Verify mod directory contains required benchmarks
   - Check for mod dependencies
   - Use configuration tools to manage working directory

2. Understand your benchmarks:
   - Use benchmark listing tools to see available compliance frameworks
   - Review benchmark documentation and requirements
   - Understand the scope and applicability of each benchmark
   - Check benchmark locations within mod directory

3. Work with controls effectively:
   - Review control requirements and expected outcomes
   - Understand control severity and impact
   - Check control dependencies and prerequisites
   - Run controls in appropriate order

4. Analyze results:
   - Review compliance status holistically
   - Prioritize findings by severity
   - Understand the context of failures
   - Document exceptions and justifications

5. Handle remediation:
   - Review suggested remediation steps
   - Validate remediation actions before applying
   - Document changes and their impact
   - Verify fixes with control re-runs

6. Stay current:
   - Keep benchmarks up to date
   - Monitor for new compliance requirements
   - Track changes in control implementations
   - Update custom benchmarks as needed
   - Maintain mod directory organization`
} as const;

export async function handleBestPracticesPrompt(): Promise<GetPromptResult> {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `When working with Powerpipe benchmarks and controls, follow these best practices:

1. Set up your working environment:
   - Configure the appropriate mod directory
   - Verify mod directory contains required benchmarks
   - Check for mod dependencies
   - Use configuration tools to manage working directory

2. Understand your benchmarks:
   - Use benchmark listing tools to see available compliance frameworks
   - Review benchmark documentation and requirements
   - Understand the scope and applicability of each benchmark
   - Check benchmark locations within mod directory

3. Work with controls effectively:
   - Review control requirements and expected outcomes
   - Understand control severity and impact
   - Check control dependencies and prerequisites
   - Run controls in appropriate order

4. Analyze results:
   - Review compliance status holistically
   - Prioritize findings by severity
   - Understand the context of failures
   - Document exceptions and justifications

5. Handle remediation:
   - Review suggested remediation steps
   - Validate remediation actions before applying
   - Document changes and their impact
   - Verify fixes with control re-runs

6. Stay current:
   - Keep benchmarks up to date
   - Monitor for new compliance requirements
   - Track changes in control implementations
   - Update custom benchmarks as needed
   - Maintain mod directory organization

Example workflow:
1. Set up environment:
   - Use powerpipe_mod_location to set your working directory
   - Use powerpipe_benchmark_list to verify required benchmarks
   - Check mod dependencies

2. List available benchmarks and controls:
   - Use powerpipe_benchmark_list to view CIS AWS Benchmark controls
   - Use powerpipe_benchmark_show to check version and applicability
   - Verify benchmark locations

3. Review specific controls:
   - Use powerpipe_control_show to get details about S3 encryption controls
   - Check control requirements and severity
   - Understand control dependencies

4. Run controls and analyze results:
   - Use powerpipe_control_run for S3 encryption controls
   - Review findings and remediation steps
   - Document compliance status`,
        }
      }
    ]
  };
} 
