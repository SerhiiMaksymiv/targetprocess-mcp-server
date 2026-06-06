
import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleUpdateUserStorySubState(
  tp: TpClient,
  params: {
    id: string
    teamId?: string
    teamAssignmentId?: string
    entityStateId?: string
  },
) {
  const response = await tp.updateUserStorySubState<TP.UserStory>(params)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to update user story sub state id: ${params.id}\n JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
