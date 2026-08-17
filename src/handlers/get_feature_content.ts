import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetFeatureContent(tp: TpClient, id: string) {
  const feature = await tp.getFeature<TP.Feature>(id)

  if (feature instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get feature, id: ${id}\n Error: ${feature.message}`
      }],
    }
  }

  const result = {
    name: feature.Name,
    id: feature.Id,
    description: '',
    entityState: feature.EntityState?.Name,
    release: feature.Release?.Name,
    epic: feature.Epic?.Name,
    progress: feature.Progress,
    effort: feature.Effort,
    customFields: feature.CustomFields,
  }

  const description = feature.Description || ''
  if (description) {
    try {
      const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
      const text = dom.window.document.getElementById('content')?.textContent
      if (text) result.description = text
    } catch (error) {
      console.error('Error parsing feature description:', error)
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }],
  }
}
