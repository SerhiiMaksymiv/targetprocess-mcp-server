import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetProcessWorkflows(tp: TpClient, processId: string) {
  const response = await tp.getProcessWorkflows<TP.TpResponseV2<TP.ProcessV2>>({ processId })

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get process workflows, Error: ${response.message}`
      }],
    }
  }

  const items = response.items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No process workflows found`,
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
