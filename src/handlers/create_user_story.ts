import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleCreateUserStory(
  tp: TpClient,
  params: {
    title: string
    description?: string
    featureId?: string
    releaseId?: string
    projectId?: string
    teamId?: string
    tags?: string
    teamIterationId?: string
  },
) {
  const response = await tp.createUserStory<TP.UserStory>(params)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create user story "${params.title}"\n Error: ${response.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
