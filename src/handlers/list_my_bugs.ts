import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleListMyBugs(
  tp: TpClient,
  params: { state?: string; take?: number; skip?: number },
) {
  const response = await tp.getMyBugs<TP.TpResponse<TP.Bug>>(params)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get bugs, JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No bugs assigned to you${params.state ? ` with state "${params.state}"` : ''}`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
