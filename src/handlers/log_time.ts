import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleLogTime(
  tp: TpClient,
  params: {
    entityId: string
    entityType: 'Task' | 'UserStory' | 'Bug'
    hours: number
    description?: string
    date?: string
  },
) {
  const response = await tp.logTime<TP.TimeLog>(params)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to log time on ${params.entityType} id: ${params.entityId}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
