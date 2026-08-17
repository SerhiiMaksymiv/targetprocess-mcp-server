import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetBugWorkflows(tp: TpClient) {
  const response = await tp.getBugWorkflows<TP.TpResponseV2<TP.WorkflowV2>>()

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get bug entity statuses, Error: ${response.message}`
      }],
    }
  }

  const items = response.items || []
  if (items.length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: `No status data found for workflows`
      }],
    }
  }

  const workflows = items.map((w) => ({
    id: w.id,
    name: w.name,
    processId: w.process,
    entityType: w.entityType,
    entityStates: w.entityStates.map((es) => ({
      id: es.id,
      name: es.name,
    })),
  }))

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(workflows) }],
  }
}
