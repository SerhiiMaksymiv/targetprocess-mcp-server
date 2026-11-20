import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { validateFeatureIfGiven, withFeatureReminder } from './feature_check.js'

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
  const featureError = await validateFeatureIfGiven(tp, params.featureId)
  if (featureError) return featureError

  const response = await tp.createUserStory<TP.UserStory>(params)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create user story "${params.title}"\n Error: ${response.message}`
      }],
    }
  }

  return withFeatureReminder(params.featureId, {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  })
}
