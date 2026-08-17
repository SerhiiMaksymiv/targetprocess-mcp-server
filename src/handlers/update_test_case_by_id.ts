import type { TpClient } from '../tp.js';

export async function handleUpdateTestCaseById(tp: TpClient, params: { id: string, name?: string, description?: string }) {
  if (params.name === undefined && params.description === undefined) {
    return {
      content: [{
        type: 'text' as const,
        text: `Nothing to update for test case id: ${params.id}`
      }],
    };
  }
  const testCaseResponse = await tp.updateTestCase(params);
  if (testCaseResponse instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to update test case id: ${params.id}\n Error: ${testCaseResponse.message}`
      }],
    };
  }
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(testCaseResponse) }],
  };
}
