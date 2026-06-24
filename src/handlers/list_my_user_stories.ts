import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleListMyUserStories(
  tp: TpClient,
  params: { state?: string; take?: number; skip?: number },
) {
  const response = await tp.getMyUserStories<TP.TpResponse<TP.UserStory>>(params)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user stories, JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No user stories assigned to you${params.state ? ` with state "${params.state}"` : ''}`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
