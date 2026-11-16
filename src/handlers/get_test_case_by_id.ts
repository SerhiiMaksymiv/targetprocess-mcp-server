import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { collectCardImages } from './images.js'

export async function handleGetTestCaseById(tp: TpClient, id: string) {
  const testCase = await tp.getTestCase<TP.TestCase>(id)

  if (testCase instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get test case id: ${id}\n Error: ${testCase.message}`
      }],
    }
  }

  let description = ''
  if (testCase.Description) {
    try {
      const dom = new JSDOM(`<html><body><div id="content">${testCase.Description}</div></body></html>`)
      description = dom.window.document.getElementById('content')?.textContent || ''
    } catch (error) {
      console.error('Error parsing test case description:', error)
    }
  }

  const testCaseSteps = await tp.getTestCaseSteps<TP.TpResponse<TP.TestStep>>(String(testCase.Id))
  const steps = testCaseSteps?.Items || []

  const result = {
    id: testCase.Id,
    name: testCase.Name,
    description,
    testPlan: testCase.TestPlans?.Items?.[0]?.Name ?? testCase.LinkedTestPlan?.Name,
    steps: steps.map((step) => ({
      description: step.Description,
      result: step.Result,
      runOrder: step.RunOrder,
    })),
    imagesFound: 0,
  }

  const combinedHtml = [testCase.Description, ...steps.map((step) => step.Description)]
    .filter(Boolean)
    .join('')
  const { foundCount, images } = await collectCardImages(tp, String(testCase.Id), combinedHtml)
  result.imagesFound = foundCount

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }, ...images],
  }
}
