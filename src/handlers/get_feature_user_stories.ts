import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetFeatureUserStories(tp: TpClient, id: string) {
  const response = await tp.getFeatureUserStories<TP.TpResponseV2<TP.TpResponseItemsV2<TP.TpResultItemV2>>>(id)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user stories for feature id: ${id}`
      }],
    }
  }

  const items = response.items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No user stories found in outer items for feature id: ${id}`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
