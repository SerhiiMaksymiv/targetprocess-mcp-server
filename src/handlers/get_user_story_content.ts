import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetUserStoryContent(tp: TpClient, id: string) {
  const userStory = await tp.getUserStory<TP.UserStory>(id)

  if (!userStory) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user story, id: ${id}\n JSON: ${JSON.stringify(userStory, null, 2)}`
      }],
    }
  }

  const description = userStory.Description || ''
  if (!description) {
    return {
      content: [{
        type: 'text' as const,
        text: `No description for ${id} tp card`,
      }],
    }
  }

  const result = {
    name: userStory.Name,
    id: userStory.Id,
    description: '',
    feature: userStory.Feature?.Name,
    featureId: userStory.Feature?.Id,
    customFields: userStory.CustomFields,
  }

  try {
    const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
    const descriptionText = dom.window.document.getElementById('content')?.textContent
    if (descriptionText) {
      result.description = descriptionText
    }
  } catch (error) {
    console.error('Error parsing user story description:', error)
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }],
  }
}
