import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { collectCardImages } from './images.js'

export async function handleGetEpicContent(tp: TpClient, id: string) {
  const epic = await tp.getEpic<TP.Epic>(id)

  if (epic instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get epic, id: ${id}\n Error: ${epic.message}`
      }],
    }
  }

  const result = {
    name: epic.Name,
    id: epic.Id,
    description: '',
    entityState: epic.EntityState?.Name,
    release: epic.Release?.Name,
    portfolioEpic: epic.PortfolioEpic?.Name,
    progress: epic.Progress,
    effort: epic.Effort,
    customFields: epic.CustomFields,
    imagesFound: 0,
  }

  const description = epic.Description || ''
  if (description) {
    try {
      const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
      const text = dom.window.document.getElementById('content')?.textContent
      if (text) result.description = text
    } catch (error) {
      console.error('Error parsing epic description:', error)
    }
  }

  const { foundCount, images } = await collectCardImages(tp, id, description)
  result.imagesFound = foundCount

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }, ...images],
  }
}
