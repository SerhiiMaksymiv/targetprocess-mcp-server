import { JSDOM } from 'jsdom'
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { collectCardImages } from './images.js'

export async function handleGetUserStoryContent(tp: TpClient, id: string) {
  const userStory = await tp.getUserStory<TP.UserStory>(id)

  if (userStory instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user story, id: ${id}\n Error: ${userStory.message}`
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
    assignedTeams: userStory.ResponsibleTeam,
    team: userStory.Team,
    imagesFound: 0,
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

  const { foundCount, images } = await collectCardImages(tp, id, description)
  result.imagesFound = foundCount

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }, ...images],
  }
}
