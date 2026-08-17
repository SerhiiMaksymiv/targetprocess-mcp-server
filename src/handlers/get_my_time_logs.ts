import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetMyTimeLogs(tp: TpClient, take?: number) {
  const response = await tp.getMyTimeLogs<TP.TpResponse<TP.TimeLog>>(take)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get time logs, Error: ${response.message}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No time logs found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
