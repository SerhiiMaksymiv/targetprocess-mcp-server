import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean }

export const NO_FEATURE_REMINDER = 'REMINDER: this user story has no parent Feature. Every user story should sit under a Feature — tell the user, and assign one with "update_user_story" (featureId). If they named the feature, resolve its ID with "search_tp_cards" (entityType "Generals") or "get_epic_features".'

/**
 * A parent Feature is optional when creating a user story, but if one is given it
 * must be a positive integer that refers to an existing Feature in Targetprocess.
 *
 * Returns an MCP error result to send back to the caller when the check fails,
 * or null when no feature was given or the feature is valid.
 */
export async function validateFeatureIfGiven(tp: TpClient, featureId: string | undefined): Promise<ToolResult | null> {
  if (featureId === undefined || featureId.trim() === '') return null

  const fail = (text: string): ToolResult => ({
    isError: true,
    content: [{ type: 'text', text }],
  })

  const id = featureId.trim()
  if (!/^[1-9]\d*$/.test(id)) {
    return fail(`"${featureId}" is not a valid Feature ID (it must be a positive integer, e.g. 153044). No user story was created. If you only have the feature's name, resolve its ID first with "search_tp_cards" (entityType "Generals") or "get_epic_features".`)
  }

  const feature = await tp.getFeature<TP.Feature | Error | null>(id)
  if (!feature || feature instanceof Error || feature.ResourceType !== 'Feature') {
    return fail(`Feature ${id} was not found in Targetprocess (it may not exist, may not be a Feature, or TP could not be reached). No user story was created. Check the ID, or resolve it by name with "search_tp_cards" (entityType "Generals") or "get_epic_features".`)
  }

  return null
}

/** Appends the "assign a feature" reminder to a successful create result when no feature was given. */
export function withFeatureReminder<R extends ToolResult>(featureId: string | undefined, result: R): R {
  if (featureId && featureId.trim() !== '') return result
  return { ...result, content: [...result.content, { type: 'text', text: NO_FEATURE_REMINDER }] }
}
