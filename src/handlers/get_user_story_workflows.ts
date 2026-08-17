import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetUserStoryWorkflows(tp: TpClient) {
  const response = await tp.getUserStoryWorkflowsWithSubStates<TP.TpResponseV2<TP.WorkflowV2WithSubStates>>()

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get user story entity statuses, Error: ${response.message}`
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

  const userStoryWorkflows = items.filter((w) => w.entityType.name === "UserStory")
  const workflows = userStoryWorkflows.map((w) => ({
    id: w.id,
    processId: w.workflow.process.id,
    entityType: w.entityType.name,
    entityStates: w.subEntityStates.map((es) => ({
      id: es.id,
      name: es.name,
    })),
  }))

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(workflows) }],
  }
}
