import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

/**
 * Every user story must sit under a parent Feature. Checks that `featureId` is a
 * positive integer and that it refers to an existing Feature in Targetprocess.
 *
 * Returns an MCP error result to send back to the caller when the check fails,
 * or null when the feature is valid and the story can be created.
 */
export async function requireExistingFeature(tp: TpClient, featureId: string | undefined) {
  const fail = (text: string) => ({
    isError: true,
    content: [{ type: 'text' as const, text }],
  })

  const id = (featureId ?? '').trim()
  if (!/^[1-9]\d*$/.test(id)) {
    return fail(`A parent Feature is required to create a user story, and "${featureId ?? ''}" is not a valid Feature ID (it must be a positive integer, e.g. 153044). No user story was created. If you only have the feature's name, resolve its ID first with "search_tp_cards" (entityType "Generals") or "get_epic_features".`)
  }

  const feature = await tp.getFeature<TP.Feature | Error | null>(id)
  if (!feature || feature instanceof Error || feature.ResourceType !== 'Feature') {
    return fail(`Feature ${id} was not found in Targetprocess (it may not exist, may not be a Feature, or TP could not be reached). No user story was created. Check the ID, or resolve it by name with "search_tp_cards" (entityType "Generals") or "get_epic_features".`)
  }

  return null
}
