import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetReleaseOpenUserStories(
  tp: TpClient,
  name: string,
  results?: number,
  withDescription?: boolean,
) {
  const release = await tp.getReleaseOpenUserStories<TP.TpResponse<TP.UserStory>>({ name, results, withDescription })

  if (release instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get ${name} release user stories, Error: ${release.message}`
      }],
    }
  }

  const items = release.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No release user stories found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
