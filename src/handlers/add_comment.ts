import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleAddComment(tp: TpClient, id: string, comment: string) {
  const response = await tp.addComment<TP.Comment>(id, comment)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to add comment to user story, id: ${id}\n JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
