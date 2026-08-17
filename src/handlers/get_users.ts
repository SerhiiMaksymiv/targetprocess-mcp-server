import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetUsers(tp: TpClient) {
  const response = await tp.getUsers<TP.TpResponse<TP.User>>()

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get users, Error: ${response.message}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No users found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
