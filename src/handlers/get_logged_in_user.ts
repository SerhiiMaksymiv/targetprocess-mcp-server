import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetLoggedInUser(tp: TpClient) {
  const ctx = await tp.getContext<TP.Context>()

  if (!ctx) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get context, JSON: ${JSON.stringify(ctx, null, 2)}`
      }],
    }
  }

  const loggedInUser = ctx.LoggedUser
  if (!loggedInUser) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get logged in user in this context, JSON: ${JSON.stringify(ctx, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(loggedInUser) }],
  }
}
