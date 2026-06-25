import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetTestPlanTestCasesWithStepsById(tp: TpClient, id: string) {
  const response = await tp.getTestPlanTestCases<TP.TpResponse<TP.TestCase>>(id)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get test cases for test plan id: ${id}\n JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No test cases found for test plan id: ${id}`,
      }],
    }
  }

  const testCasesData = await Promise.all(items.map(async (item) => {
    let description = ''
    if (item.Description) {
      try {
        const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
        description = dom.window.document.getElementById('content')?.textContent || ''
      } catch (error) {
        console.error('Error parsing test case description:', error)
      }
    }

    const testCaseSteps = await tp.getTestCaseSteps<TP.TpResponse<TP.TestStep>>(String(item.Id))

    return {
      testCaseId: item.Id,
      testCaseName: item.Name,
      testCaseDescription: description,
      testPlanId: item.TestPlanId,
      testPlanName: item.TestPlanName,
      testCaseSteps: testCaseSteps?.Items?.map((step) => ({
        description: step.Description,
        result: step.Result,
        runOrder: step.RunOrder,
      })) || [],
    }
  }))

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(testCasesData) }],
  }
}
