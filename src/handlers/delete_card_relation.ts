import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleDeleteCardRelation(tp: TpClient, relationId: string) {
  const result = await tp.deleteRelation<TP.Relation>(relationId)

  if (!result.ok) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to delete relation id: ${relationId}\n` +
          `HTTP status: ${result.status}\n` +
          `Response body: ${result.body}`
      }],
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ deleted: true, relationId: Number(relationId), relation: result.data })
    }],
  }
}
