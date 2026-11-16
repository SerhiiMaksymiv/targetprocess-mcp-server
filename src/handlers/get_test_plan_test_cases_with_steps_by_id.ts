import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { extractImageUrls } from '../html.js'
import { fetchImagesAsContent } from './images.js'

export async function handleGetTestPlanTestCasesWithStepsById(tp: TpClient, id: string) {
  const response = await tp.getTestPlanTestCases<TP.TpResponse<TP.TestCase>>(id)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get test cases for test plan id: ${id}\n Error: ${response.message}`
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

  const allImageUrls: string[] = []

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
    const steps = testCaseSteps?.Items || []

    const imageUrls = [item.Description, ...steps.map((step) => step.Description)]
      .flatMap((html) => extractImageUrls(html || ''))
    allImageUrls.push(...imageUrls)

    return {
      testCaseId: item.Id,
      testCaseName: item.Name,
      testCaseDescription: description,
      testPlanId: item.TestPlanId,
      testPlanName: item.TestPlanName,
      testCaseSteps: steps.map((step) => ({
        description: step.Description,
        result: step.Result,
        runOrder: step.RunOrder,
      })),
      imagesFound: imageUrls.length,
    }
  }))

  const { images } = await fetchImagesAsContent(tp, allImageUrls)

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(testCasesData) }, ...images],
  }
}
