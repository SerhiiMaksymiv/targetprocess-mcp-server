import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetUserStoryBugs(tp: TpClient, id: string) {
  const response = await tp.getUserStoryBugs<TP.TpResponseV2<TP.TpResponseItemsV2<TP.TpResultItemV2>>>(id)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get bugs for user story id: ${id}`
      }],
    }
  }

  const items = response.items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No bugs found for user story id: ${id}`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
