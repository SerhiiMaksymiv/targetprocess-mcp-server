import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleGetFeatureContent } from '../src/handlers/get_feature_content.js'
import { handleUpdateFeature } from '../src/handlers/update_feature.js'
import type { TpClient } from '../src/tp.js'

const mockTp = {
  getFeature: vi.fn(),
  updateFeature: vi.fn(),
} as unknown as TpClient

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleGetFeatureContent', () => {
  it('returns name, id, and stripped description', async () => {
    vi.mocked(mockTp.getFeature).mockResolvedValue({
      Id: 145636,
      Name: 'Feature A',
      Description: '<p>Some <strong>details</strong></p>',
      EntityState: { Name: 'Open' },
      Release: { Name: 'R1' },
      Epic: { Name: 'Epic A' },
      Progress: 0.5,
      Effort: 10,
      CustomFields: [],
    } as any)

    const result = await handleGetFeatureContent(mockTp, '145636')
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.id).toBe(145636)
    expect(parsed.name).toBe('Feature A')
    expect(parsed.description).toBe('Some details')
    expect(parsed.entityState).toBe('Open')
  })

  it('returns failure message when feature is not found', async () => {
    vi.mocked(mockTp.getFeature).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleGetFeatureContent(mockTp, '145636')

    expect(result.content[0].text).toContain('Failed to get feature, id: 145636')
  })
})

describe('handleUpdateFeature', () => {
  it('returns updated feature on success', async () => {
    vi.mocked(mockTp.updateFeature).mockResolvedValue({ Id: 145636, Name: 'Updated' } as any)

    const result = await handleUpdateFeature(mockTp, { id: '145636', title: 'Updated' })
    const parsed = JSON.parse(result.content[0].text)

    expect(parsed.Name).toBe('Updated')
    expect(mockTp.updateFeature).toHaveBeenCalledWith({ id: '145636', title: 'Updated' })
  })

  it('returns failure message when null', async () => {
    vi.mocked(mockTp.updateFeature).mockResolvedValue(new Error('Simulated failure') as any)

    const result = await handleUpdateFeature(mockTp, { id: '145636' })

    expect(result.content[0].text).toContain('Failed to update feature id: 145636')
  })

  it('passes epicId, tags, and teamIterationId to updateFeature', async () => {
    vi.mocked(mockTp.updateFeature).mockResolvedValue({ Id: 145636 } as any)

    await handleUpdateFeature(mockTp, { id: '145636', epicId: '148813', tags: 'regression, mobile', teamIterationId: '789' })

    expect(mockTp.updateFeature).toHaveBeenCalledWith({ id: '145636', epicId: '148813', tags: 'regression, mobile', teamIterationId: '789' })
  })
})
