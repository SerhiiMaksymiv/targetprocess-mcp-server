import type { TpClient } from '../tp.js';

export async function handleAddTestCaseStepById(tp: TpClient, params: { testCaseId: string, description: string, result: string }) {
  const testStepResponse = await tp.addTestStep(params.testCaseId, {
    description: params.description,
    result: params.result,
  });
  if (testStepResponse instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to add test step to test case id: ${params.testCaseId}\n Error: ${testStepResponse.message}`
      }],
    };
  }
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(testStepResponse) }],
  };
}
