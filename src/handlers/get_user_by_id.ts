import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetUserById(tp: TpClient, id: string) {
  const user = await tp.getUser<TP.User>(id)

  if (user instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user, id: ${id}\n Error: ${user.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(user) }],
  }
}
