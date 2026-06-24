import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetReleaseUserStories(
  tp: TpClient,
  name: string,
  results?: number,
  withDescription?: boolean,
) {
  const release = await tp.getReleaseUserStories<TP.TpResponse<TP.UserStory>>({ name, results, withDescription })

  if (!release) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get ${name} release user stories, JSON: ${JSON.stringify(release, null, 2)}`
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
