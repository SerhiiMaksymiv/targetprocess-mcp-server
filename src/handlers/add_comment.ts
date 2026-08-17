import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleAddComment(tp: TpClient, id: string, comment: string) {
  const response = await tp.addComment<TP.Comment>(id, comment)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to add comment to user story, id: ${id}\n Error: ${response.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
