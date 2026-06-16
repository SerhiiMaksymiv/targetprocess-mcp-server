import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleCreateTask(
  tp: TpClient,
  params: {
    title: string
    userStoryId: string
    description?: string
  },
) {
  const response = await tp.createTask<TP.Task>(params)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create task "${params.title}"\n JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
