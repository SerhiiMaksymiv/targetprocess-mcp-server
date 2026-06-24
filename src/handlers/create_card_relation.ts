import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleCreateCardRelation(
  tp: TpClient,
  params: {
    masterId: string
    slaveId: string
    relationType?: string
  },
) {
  const wanted = params.relationType || 'Depends on'

  // Resolve the relation type name → Id. TP rejects relations whose RelationType
  // is passed by Name (405 Method Not Allowed), so we look up the existing type.
  const typesResponse = await tp.getRelationTypes<TP.TpResponse<TP.RelationType>>()
  const types = typesResponse?.Items || []

  const match = types.find((t) => t.Name.toLowerCase() === wanted.toLowerCase())
  if (!match) {
    const available = types.map((t) => `${t.Name} (id: ${t.Id})`).join(', ')
    return {
      content: [{
        type: 'text' as const,
        text: `Unknown relation type "${wanted}". Available relation types in this instance: ${available || '(none returned)'}`
      }],
    }
  }

  const result = await tp.createRelation<TP.Relation>({
    masterId: params.masterId,
    slaveId: params.slaveId,
    relationTypeId: String(match.Id),
  })

  if (!result.ok) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create "${match.Name}" relation between master id: ${params.masterId} and slave id: ${params.slaveId}\n` +
          `HTTP status: ${result.status}\n` +
          `Response body: ${result.body}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result.data) }],
  }
}
