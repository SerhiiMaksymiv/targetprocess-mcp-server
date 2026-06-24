import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetUserById(tp: TpClient, id: string) {
  const user = await tp.getUser<TP.User>(id)

  if (!user) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user, id: ${id}\n JSON: ${JSON.stringify(user, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(user) }],
  }
}
