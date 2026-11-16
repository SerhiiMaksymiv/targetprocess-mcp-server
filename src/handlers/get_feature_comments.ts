import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { extractImageUrls } from '../html.js'
import { fetchImagesAsContent } from './images.js'

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
    const commentImageUrls = items.map((item) => extractImageUrls(item.Description || ''))

    const parsedItems = items.map((item, index) => {
      const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
      const descriptionText = dom.window.document.getElementById('content')?.textContent
      return {
        id: item.Id,
        description: descriptionText,
        createDate: item.CreateDate,
        owner: item.Owner.FullName,
        imagesFound: commentImageUrls[index].length,
      }
    })

    const { images } = await fetchImagesAsContent(tp, commentImageUrls.flat())

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(parsedItems) }, ...images],
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
