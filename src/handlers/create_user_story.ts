import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { tpErrorText } from './tp_error.js'
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

  const result = await tp.createUserStory<TP.UserStory>(params)

  if (!result.ok) {
    return {
      isError: true,
      content: [{
        type: 'text' as const,
        text: `Failed to create user story "${params.title}" — Targetprocess said ${tpErrorText(result.status, result.body)}`
      }],
    }
  }
  const response = result.data

  return withFeatureReminder(params.featureId, {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  })
}
