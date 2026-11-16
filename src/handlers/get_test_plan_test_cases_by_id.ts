import { JSDOM } from 'jsdom';
import type { TpClient } from '../tp.js';
import type * as TP from '../types.js';
import { extractImageUrls } from '../html.js';
import { fetchImagesAsContent } from './images.js';

export async function handleGetTestPlanTestCasesById(tp: TpClient, id: string) {
  const response = await tp.getIndirectTestPlanTestCases<TP.TpResponse<TP.TestCase>>(id);
  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get test cases for test plan id: ${id}\n JSON: ${JSON.stringify(response, null, 2)}`
      }],
    };
  }
  const items = response.Items || [];
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No test cases found for test plan id: ${id}`,
      }],
    };
  }
  const itemImageUrls = items.map((item) => extractImageUrls(item.Description || ''));

  const testCases = items.map((item, index) => {
    let description = '';
    if (item.Description) {
      try {
        const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`);
        description = dom.window.document.getElementById('content')?.textContent || '';
      }
      catch (error) {
        console.error('Error parsing test case description:', error);
      }
    }
    return {
      id: item.Id,
      name: item.Name,
      description,
      testPlanId: item.TestPlanId,
      testPlanName: item.TestPlanName,
      imagesFound: itemImageUrls[index].length,
    };
  });

  const { images } = await fetchImagesAsContent(tp, itemImageUrls.flat());

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(testCases) }, ...images],
  };
}
