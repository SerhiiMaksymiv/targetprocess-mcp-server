import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleCreateEpic } from '../src/handlers/create_epic.js'
import { handleGetEpicContent } from '../src/handlers/get_epic_content.js'
import { handleUpdateEpic } from '../src/handlers/update_epic.js'
import { handleGetEpicFeatures } from '../src/handlers/get_epic_features.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  createEpic: vi.fn(),
  getEpic: vi.fn(),
  updateEpic: vi.fn(),
  getEpicFeatures: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleCreateEpic', () => {
  it('returns created epic on success', async () => {
    vi.mocked(mockTp.createEpic).mockResolvedValue({ Id: 148813, Name: 'New Epic' } as any)

    const result = await handleCreateEpic(mockTp, { title: 'New Epic' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Id).toBe(148813)
    expect(mockTp.createEpic).toHaveBeenCalledWith({ title: 'New Epic' })
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.createEpic).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleCreateEpic(mockTp, { title: 'New Epic' })

    expect(result.content[0].text).toContain('Failed to create epic "New Epic"')
  })
})

describe('handleGetEpicContent', () => {
  it('returns name, id, and stripped description', async () => {
    vi.mocked(mockTp.getEpic).mockResolvedValue({
      Id: 148813,
      Name: 'Epic A',
      Description: '<p>Some <strong>details</strong></p>',
      EntityState: { Name: 'Open' },
      Release: { Name: 'R1' },
      PortfolioEpic: { Name: 'PE1' },
      Progress: 0.5,
      Effort: 10,
      CustomFields: [],
    } as any)

    const result = await handleGetEpicContent(mockTp, '148813')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(148813)
    expect(parsed.name).toBe('Epic A')
    expect(parsed.description).toBe('Some details')
    expect(parsed.entityState).toBe('Open')
  })

  it('returns failure message when epic is not found', async () => {
    vi.mocked(mockTp.getEpic).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetEpicContent(mockTp, '148813')

    expect(result.content[0].text).toContain('Failed to get epic, id: 148813')
  })
})

describe('handleUpdateEpic', () => {
  it('returns updated epic on success', async () => {
    vi.mocked(mockTp.updateEpic).mockResolvedValue({ Id: 148813, Name: 'Updated' } as any)

    const result = await handleUpdateEpic(mockTp, { id: '148813', title: 'Updated' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Name).toBe('Updated')
    expect(mockTp.updateEpic).toHaveBeenCalledWith({ id: '148813', title: 'Updated' })
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.updateEpic).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleUpdateEpic(mockTp, { id: '148813' })

    expect(result.content[0].text).toContain('Failed to update epic id: 148813')
  })
})

describe('handleGetEpicFeatures', () => {
  it('returns mapped features', async () => {
    vi.mocked(mockTp.getEpicFeatures).mockResolvedValue({
      Items: [
        { Id: 1, Name: 'Feature A', EntityState: { Name: 'Open' }, Team: { Name: 'Team A' }, Progress: 0.2, Effort: 5 },
      ],
    } as any)

    const result = await handleGetEpicFeatures(mockTp, '148813')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.total).toBe(1)
    expect(parsed.features[0].name).toBe('Feature A')
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.getEpicFeatures).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetEpicFeatures(mockTp, '148813')

    expect(result.content[0].text).toContain('Failed to get features for epic id: 148813')
  })

  it('returns empty result when no features', async () => {
    vi.mocked(mockTp.getEpicFeatures).mockResolvedValue({ Items: [] } as any)

    const result = await handleGetEpicFeatures(mockTp, '148813')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.total).toBe(0)
    expect(parsed.features).toEqual([])
  })
})
