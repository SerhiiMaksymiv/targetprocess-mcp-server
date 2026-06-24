import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetBugContent(tp: TpClient, id: string) {
  const bug = await tp.getBug<TP.Bug>(id)

  if (!bug) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get bug, id: ${id}\n JSON: ${JSON.stringify(bug, null, 2)}`
      }],
    }
  }

  const bugResult = {
    name: bug.Name,
    id: bug.Id,
    description: '',
    origin: '',
  }

  try {
    const dom = new JSDOM(`<html><body><div id="content">${bug.Description}</div></body></html>`)
    const descriptionText = dom.window.document.getElementById('content')?.textContent
    if (descriptionText) {
      bugResult.description = descriptionText
    }
  } catch (error) {
    console.error('Error parsing bug description:', error)
  }

  try {
    bugResult.origin = bug.CustomFields?.find((field) => field?.Value === 'Origin')?.Value
  } catch (error) {
    console.error('Error parsing bug origin:', error)
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(bugResult) }],
  }
}
