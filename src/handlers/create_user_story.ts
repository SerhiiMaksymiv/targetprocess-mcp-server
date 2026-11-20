import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'
import { requireExistingFeature } from './require_feature.js'

export async function handleCreateUserStory(
  tp: TpClient,
  params: {
    title: string
    description?: string
    featureId: string
    releaseId?: string
    projectId?: string
    teamId?: string
    tags?: string
    teamIterationId?: string
  },
) {
  const featureError = await requireExistingFeature(tp, params.featureId)
  if (featureError) return featureError

  const response = await tp.createUserStory<TP.UserStory>({ ...params, featureId: params.featureId.trim() })

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
