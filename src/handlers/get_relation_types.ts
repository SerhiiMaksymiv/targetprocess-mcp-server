import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetRelationTypes(tp: TpClient) {
  const response = await tp.getRelationTypes<TP.TpResponse<TP.RelationType>>()

  if (response instanceof Error) {
    return {
      content: [{ type: 'text' as const, text: `Failed to get relation types` }],
    }
  }

  const items = (response.Items || []).map((t) => ({ id: t.Id, name: t.Name }))
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
