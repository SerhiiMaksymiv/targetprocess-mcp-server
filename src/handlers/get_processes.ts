import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetProcesses(tp: TpClient) {
  const response = await tp.getProcesses<TP.TpResponseV2<TP.ProcessV2>>()

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get processes, Error: ${response.message}`
      }],
    }
  }

  const items = response.items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No processes found`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
