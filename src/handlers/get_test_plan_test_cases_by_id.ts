import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetTestPlanTestCasesById(tp: TpClient, id: string) {
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

  const testCases = items.map((item) => {
    let description = ''
    if (item.Description) {
      try {
        const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
        description = dom.window.document.getElementById('content')?.textContent || ''
      } catch (error) {
        console.error('Error parsing test case description:', error)
      }
    }

    return {
      id: item.Id,
      name: item.Name,
      description,
      testPlanId: item.TestPlanId,
      testPlanName: item.TestPlanName,
    }
  })

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(testCases) }],
  }
}
