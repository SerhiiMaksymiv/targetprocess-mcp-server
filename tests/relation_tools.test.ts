import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetCardRelations } from '../src/handlers/get_card_relations.js'
import { handleCreateCardRelation } from '../src/handlers/create_card_relation.js'
import { handleDeleteCardRelation } from '../src/handlers/delete_card_relation.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getCardRelations: vi.fn(),
  getRelationTypes: vi.fn(),
  createRelation: vi.fn(),
  deleteRelation: vi.fn(),
} as unknown as TpClient

const relationTypes = {
  Items: [
    { Id: 10, Name: 'Depends on' },
    { Id: 20, Name: 'Relate to' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetCardRelations', () => {
  it('returns mapped relations with direction', async () => {
    vi.mocked(mockTp.getCardRelations).mockResolvedValue({
      Items: [
        {
          Id: 1,
          RelationType: { Name: 'Dependency' },
          Master: { Id: 145789, Name: 'Story A', EntityType: { Name: 'UserStory' } },
          Slave: { Id: 145790, Name: 'Story B', EntityType: { Name: 'UserStory' } },
        },
        {
          Id: 2,
          RelationType: { Name: 'Blocker' },
          Master: { Id: 145791, Name: 'Bug C', EntityType: { Name: 'Bug' } },
          Slave: { Id: 145789, Name: 'Story A', EntityType: { Name: 'UserStory' } },
        },
      ],
    } as any)

    const result = await handleGetCardRelations(mockTp, '145789')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({
      relationId: 1,
      relationType: 'Dependency',
      direction: 'outbound',
      relatedCard: { id: 145790, name: 'Story B', entityType: 'UserStory' },
    })
    expect(parsed[1].direction).toBe('inbound')
    expect(parsed[1].relatedCard.id).toBe(145791)
  })

  it('returns message when no relations found', async () => {
    vi.mocked(mockTp.getCardRelations).mockResolvedValue({ Items: [] } as any)

    const result = await handleGetCardRelations(mockTp, '145789')

    expect(result.content[0].text).toContain('No relations found for card id: 145789')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getCardRelations).mockResolvedValue(null as any)

    const result = await handleGetCardRelations(mockTp, '145789')

    expect(result.content[0].text).toContain('Failed to get relations for card id: 145789')
  })
})

describe('handleCreateCardRelation', () => {
  beforeEach(() => {
    vi.mocked(mockTp.getRelationTypes).mockResolvedValue(relationTypes as any)
  })

  it('resolves the relation type name to its id before creating', async () => {
    vi.mocked(mockTp.createRelation).mockResolvedValue({
      ok: true,
      data: {
        Id: 99,
        RelationType: { Name: 'Depends on' },
        Master: { Id: 145789 },
        Slave: { Id: 145790 },
      },
    } as any)

    const result = await handleCreateCardRelation(mockTp, { masterId: '145789', slaveId: '145790', relationType: 'depends on' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(99)
    expect(mockTp.createRelation).toHaveBeenCalledWith({ masterId: '145789', slaveId: '145790', relationTypeId: '10' })
  })

  it('lists available types when the relation type is unknown', async () => {
    const result = await handleCreateCardRelation(mockTp, { masterId: '145789', slaveId: '145790', relationType: 'Nope' })

    expect(result.content[0].text).toContain('Unknown relation type "Nope"')
    expect(result.content[0].text).toContain('Depends on (id: 10)')
    expect(result.content[0].text).toContain('Relate to (id: 20)')
    expect(mockTp.createRelation).not.toHaveBeenCalled()
  })

  it('surfaces HTTP status and response body on failure', async () => {
    vi.mocked(mockTp.createRelation).mockResolvedValue({
      ok: false,
      status: 400,
      body: '{"Status":"BadRequest","Message":"Relation already exists"}',
    } as any)

    const result = await handleCreateCardRelation(mockTp, { masterId: '145789', slaveId: '145790', relationType: 'Depends on' })

    expect(result.content[0].text).toContain('Failed to create "Depends on" relation between master id: 145789 and slave id: 145790')
    expect(result.content[0].text).toContain('HTTP status: 400')
    expect(result.content[0].text).toContain('Relation already exists')
  })
})

describe('handleDeleteCardRelation', () => {
  it('returns deleted confirmation on success', async () => {
    vi.mocked(mockTp.deleteRelation).mockResolvedValue({
      ok: true,
      data: { Id: 20748 },
    } as any)

    const result = await handleDeleteCardRelation(mockTp, '20748')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.deleted).toBe(true)
    expect(parsed.relationId).toBe(20748)
    expect(mockTp.deleteRelation).toHaveBeenCalledWith('20748')
  })

  it('surfaces HTTP status and response body on failure', async () => {
    vi.mocked(mockTp.deleteRelation).mockResolvedValue({
      ok: false,
      status: 404,
      body: '{"Status":"NotFound","Message":"Relation 999 not found"}',
    } as any)

    const result = await handleDeleteCardRelation(mockTp, '999')

    expect(result.content[0].text).toContain('Failed to delete relation id: 999')
    expect(result.content[0].text).toContain('HTTP status: 404')
    expect(result.content[0].text).toContain('Relation 999 not found')
  })
})
