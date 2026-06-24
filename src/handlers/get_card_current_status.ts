import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetCardCurrentStatus(
  tp: TpClient,
  id: string,
  resourceType: 'UserStory' | 'Bug' | 'Feature' = 'UserStory',
) {
  const response = await tp.getCardStatus<TP.TpResponseV2<TP.CardStatus>>(id, resourceType)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get card status for ${resourceType} id: ${id}`
      }],
    }
  }

  const items = response.items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No status data found for ${resourceType} id: ${id}`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items[0]) }],
  }
}
