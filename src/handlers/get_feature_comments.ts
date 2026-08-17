import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetFeatureComments(tp: TpClient, id: string, results?: number) {
  const response = await tp.getFeatureComments<TP.TpResponse<TP.Comment>>(id, results)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get comments for feature id: ${id}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No comments found for feature id: ${id}`,
      }],
    }
  }

  try {
    const parsedItems = items.map((item) => {
      const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
      const descriptionText = dom.window.document.getElementById('content')?.textContent
      return {
        id: item.Id,
        description: descriptionText,
        createDate: item.CreateDate,
        owner: item.Owner.FullName,
      }
    })

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(parsedItems) }],
    }
  } catch (error) {
    console.error('Error parsing feature comments:', error)
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to parse feature comments for feature id: ${id}`,
      }],
    }
  }
}
